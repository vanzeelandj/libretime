from future.standard_library import install_aliases

install_aliases()

import cgi
import json
import os
import posixpath
import shutil
import tempfile
import traceback
from contextlib import closing
from io import StringIO
from urllib.parse import urlsplit

import mutagen
import requests
from celery import Celery
from celery.utils.log import get_task_logger

celery = Celery()
logger = get_task_logger(__name__)


@celery.task(name="podcast-download", acks_late=True)
def podcast_download(
    id, url, callback_url, api_key, podcast_name, album_override, track_title
):
    """
    Download a podcast episode

    :param id:              episode unique ID
    :param url:             download url for the episode
    :param callback_url:    callback URL to send the downloaded file to
    :param api_key:         API key for callback authentication
    :param podcast_name:    Name of podcast to be added to id3 metadata for smartblock
    :param album_override:  Passing whether to override the album id3 even if it exists
    :param track_title:     Passing the title of the episode from feed to override the metadata

    :return: JSON formatted string of a dictionary of download statuses
             and file identifiers (for successful uploads)
    :rtype: string
    """
    # Object to store file IDs, episode IDs, and download status
    # (important if there's an error before the file is posted)
    obj = {"episodeid": id}
    try:
        re = None
        with closing(requests.get(url, stream=True)) as r:
            filename = get_filename(r)
            with tempfile.NamedTemporaryFile(mode="wb+", delete=False) as audiofile:
                r.raw.decode_content = True
                shutil.copyfileobj(r.raw, audiofile)
                # mutagen should be able to guess the write file type
                metadata_audiofile = mutagen.File(audiofile.name, easy=True)
                # if for some reason this should fail lets try it as a mp3 specific code
                if metadata_audiofile == None:
                    # if this happens then mutagen couldn't guess what type of file it is
                    mp3suffix = ("mp3", "MP3", "Mp3", "mP3")
                    # so we treat it like a mp3 if it has a mp3 file extension and hope for the best
                    if filename.endswith(mp3suffix):
                        metadata_audiofile = mutagen.mp3.MP3(
                            audiofile.name, ID3=mutagen.easyid3.EasyID3
                        )
                # replace track metadata as indicated by album_override setting
                # replace album title as needed
                metadata_audiofile = podcast_override_metadata(
                    metadata_audiofile, podcast_name, album_override, track_title
                )
                metadata_audiofile.save()
                filetypeinfo = metadata_audiofile.pprint()
                logger.info(
                    "filetypeinfo is {0}".format(filetypeinfo.encode("ascii", "ignore"))
                )
                re = requests.post(
                    callback_url,
                    files={"file": (filename, open(audiofile.name, "rb"))},
                    auth=requests.auth.HTTPBasicAuth(api_key, ""),
                )
        re.raise_for_status()
        try:
            response = re.content.decode()
        except (UnicodeDecodeError, AttributeError):
            response = re.content
        f = json.loads(
            response
        )  # Read the response from the media API to get the file id
        obj["fileid"] = f["id"]
        obj["status"] = 1
    except Exception as e:
        obj["error"] = e.message
        logger.info("Error during file download: {0}".format(e))
        logger.debug("Original Traceback: %s" % (traceback.format_exc(e)))
        obj["status"] = 0
    return json.dumps(obj)


def podcast_override_metadata(m, podcast_name, override, track_title):
    """
    Override m['album'] if empty or forced with override arg
    """
    # if the album override option is enabled replace the album id3 tag with the podcast name even if the album tag contains data
    if override is True:
        logger.debug(
            "overriding album name to {0} in podcast".format(
                podcast_name.encode("ascii", "ignore")
            )
        )
        m["album"] = podcast_name
        m["title"] = track_title
        m["artist"] = podcast_name
    else:
        # replace the album id3 tag with the podcast name if the album tag is empty
        try:
            m["album"]
        except KeyError:
            logger.debug(
                "setting new album name to {0} in podcast".format(
                    podcast_name.encode("ascii", "ignore")
                )
            )
            m["album"] = podcast_name
    return m


def get_filename(r):
    """
    Given a request object to a file resource, get the name of the file to be downloaded
    by parsing either the content disposition or the request URL

    :param r: request object

    :return: the file name
    :rtype: string
    """
    # Try to get the filename from the content disposition
    d = r.headers.get("Content-Disposition")
    filename = ""
    if d:
        try:
            _, params = cgi.parse_header(d)
            filename = params["filename"]
        except Exception as e:
            # We end up here if we get a Content-Disposition header with no filename
            logger.warn(
                "Couldn't find file name in Content-Disposition header, using url"
            )
    if not filename:
        # Since we don't necessarily get the filename back in the response headers,
        # parse the URL and get the filename and extension
        path = urlsplit(r.url).path
        filename = posixpath.basename(path)
    return filename
