<?php

class EmbeddableWidgetsController extends Zend_Controller_Action
{

    public function init()
    {

    }

    public function playerAction()
    {
        Zend_Layout::getMvcInstance()->assign('parent_page', 'Widgets');

        $CC_CONFIG = Config::getConfig();
        $baseUrl = Application_Common_OsPath::getBaseDir();
        $this->view->headLink()->appendStylesheet($baseUrl.'css/player-form.css?'.$CC_CONFIG['airtime_version']);
        $this->view->headScript()->appendFile($baseUrl.'js/airtime/player/player.js?'.$CC_CONFIG['airtime_version']);

        $form = new Application_Form_Player();

        $apiEnabled = Application_Model_Preference::GetAllow3rdPartyApi();
        $numEnabledStreams = $form->getElement('player_stream_url')->getAttrib('numberOfEnabledStreams');

        if ($numEnabledStreams > 0 && $apiEnabled) {
            $this->view->player_form = $form;
        } else {
            $this->view->player_error_msg = _("To configure and use the embeddable player you must:<br><br>
            1. Enable at least one MP3, AAC, or OGG stream under Settings -> Streams<br>
            2. Enable the Public LibreTime API under Settings -> Preferences");
        }
    }

    public function scheduleAction()
    {
        Zend_Layout::getMvcInstance()->assign('parent_page', 'Widgets');

        $apiEnabled = Application_Model_Preference::GetAllow3rdPartyApi();

        if (!$apiEnabled) {
            $this->view->weekly_schedule_error_msg = _("To use the embeddable weekly schedule widget you must:<br><br>
            Enable the Public LibreTime API under Settings -> Preferences");
        }
    }

    // The Facebook widget is untested & unsupported, the widget has been removed from the navigation in navigation.php
    public function facebookAction()
    {
        Zend_Layout::getMvcInstance()->assign('parent_page', 'Widgets');

        $apiEnabled = Application_Model_Preference::GetAllow3rdPartyApi();

        if (!$apiEnabled) {
            $this->view->facebook_error_msg = _("To add the Radio Tab to your Facebook Page, you must first:<br><br>
            Enable the Public LibreTime API under Settings -> Preferences");
        }

        $CC_CONFIG = Config::getConfig();
        $baseUrl = Application_Common_OsPath::getBaseDir();

        $facebookAppId = $CC_CONFIG['facebook-app-id'];
        $this->view->headScript()->appendScript("var FACEBOOK_APP_ID = " . json_encode($facebookAppId) . ";");
        $this->view->headScript()->appendFile($baseUrl . 'js/airtime/common/facebook.js?' . $CC_CONFIG['airtime_version'], 'text/javascript');
    }

    /** Airtime makes an AJAX POST here after it successfully adds a tab to your Facebook page. */
    public function facebookTabSuccessAction()
    {
        // disable the view and the layout
        $this->view->layout()->disableLayout();
        $this->_helper->viewRenderer->setNoRender(true);

        //TODO: Get list of page IDs (deserialize)

        $request = $this->getRequest();
        if (!$request->isPost()) {
            return;
        }

        $values = $request->getPost();
        $facebookPageIds = json_decode($values["pages"]);

        $CC_CONFIG = Config::getConfig();
        $facebookMicroserviceUrl = $CC_CONFIG['facebook-app-url'];
        $facebookMicroserviceApiKey = $CC_CONFIG['facebook-app-api-key'];

        //Post the page tab ID and station subdomain to the social microservice so that mapping can be saved
        //in a database.
        foreach ($facebookPageIds as $facebookPageId)
        {
            $postfields = array();
            $postfields["facebookPageId"] = $facebookPageId;
            $postfields["stationId"] = $CC_CONFIG['stationId'];

            $query_string = "";
            foreach ($postfields as $k => $v) $query_string .= "$k=".urlencode($v)."&";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $facebookMicroserviceUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_FAILONERROR, 1);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $query_string);
            curl_setopt($ch, CURLOPT_USERPWD, ":$facebookMicroserviceApiKey");
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

            $jsondata = curl_exec($ch);
            if (curl_error($ch)) {
                throw new Exception("Failed to reach server in " . __FUNCTION__ . ": "
                    . curl_errno($ch) . ' - ' . curl_error($ch) . ' - ' . curl_getinfo($ch, CURLINFO_EFFECTIVE_URL));
            }
            curl_close($ch);

        }

        //$arr = json_decode($jsondata, true); # Decode JSON String

    }
}

