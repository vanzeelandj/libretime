var AIRTIME = (function (AIRTIME) {
    var mod;

    if (AIRTIME.podcast === undefined) {
        AIRTIME.podcast = {};
    }

    mod = AIRTIME.podcast;

    var endpoint = 'rest/podcast/', PodcastEpisodeTable, $stationPodcastTab;

    /**
     * PodcastController constructor.
     *
     * @param {angular.scope}   $scope           angular scope service object
     * @param {angular.http}    $http            angular http service object
     * @param {Object}          podcast          podcast metadata object
     * @param {int}             podcast.id       podcast unique identifier
     * @param {string}          podcast.title    podcast metadata title
     * @param {Tab}             tab              Tab object the controller is being bootstrapped in
     *
     * @constructor
     */
    function PodcastController($scope, $http, podcast, tab) {
        // We need to pass in the tab object and the episodes table object so we can reference them
        var self = this;

        //We take a podcast object in as a parameter rather fetching the podcast by ID here because
        //when you're creating a new podcast, we already have the object from the result of the POST. We're saving
        //a roundtrip by not fetching it again here.
        $scope.podcast = podcast;
        $scope.tab = tab;
        $scope.csrf = jQuery("#csrf").val();
        tab.contents.find("table").attr("id", "podcast_episodes_" + podcast.id);

        /**
         * Override the switchTo function to reload the table when the tab is focused.
         * Should help to reduce the number of cases where the frontend doesn't match the state
         * of the backend (due to automatic ingestion).
         *
         * Note that these cases should already be very few and far between.
         *
         * TODO: make sure this doesn't noticeably slow performance
         * XXX: it's entirely possible that this (in the angular app) is not where we want this function...
         */
        tab.switchTo = function () {
            AIRTIME.tabs.Tab.prototype.switchTo.call(this);
            self.reloadEpisodeTable();
        };

        /**
         * Save and update the podcast object.
         */
        $scope.savePodcast = function () {
            $http.put(endpoint + $scope.podcast.id, {csrf_token: $scope.csrf, podcast: $scope.podcast})
                .success(function () {
                    AIRTIME.library.podcastDataTable.fnDraw();
                    tab.setName($scope.podcast.title);
                });
        };

        /**
         * Close the tab and discard any changes made to the podcast data.
         */
        $scope.discard = function () {
            tab.close();
            $scope.podcast = {};
        };

        self.$scope = $scope;
        self.$http = $http;
        self.initialize();

        return self;
    }

    /**
     * Initialize the podcast episode table.
     *
     * @private
     */
    PodcastController.prototype._initTable = function() {
        /*
         * Remove the episode table for imported podcasts since its functionality is replicated in the left-hand pane
         *
        var self = this,
            $scope = self.$scope;
        // We want to fetch the data statically for imported podcasts because we would need to implement sorting
        // in a very convoluted way on the backend to accommodate the nonexistent rows for uningested episodes
        var params = {
            bServerSide : false,
            sAjaxSource : null,
            // Initialize the table with empty data so we can defer loading
            // If we load sequentially there's a delay before the table appears
            aaData      : {},
            aoColumns   : [
                { "sTitle" : ""                            , "mDataProp" : "guid"           , "sClass" : "podcast_episodes_guid"        , "bVisible" : false },
                { "sTitle" : $.i18n._("Title")             , "mDataProp" : "title"          , "sClass" : "podcast_episodes_title"       , "sWidth" : "170px" },
                { "sTitle" : $.i18n._("Author")            , "mDataProp" : "author"         , "sClass" : "podcast_episodes_author"      , "sWidth" : "170px" },
                { "sTitle" : $.i18n._("Description")       , "mDataProp" : "description"    , "sClass" : "podcast_episodes_description" , "sWidth" : "300px" },
                { "sTitle" : $.i18n._("Link")              , "mDataProp" : "link"           , "sClass" : "podcast_episodes_link"        , "sWidth" : "170px" },
                { "sTitle" : $.i18n._("Publication Date")  , "mDataProp" : "pub_date"       , "sClass" : "podcast_episodes_pub_date"    , "sWidth" : "170px" }
            ]
        },
            buttons = {
                slideToggle: {},
                importBtn: {
                    title           : $.i18n._('Import Selected'),
                    iconClass       : '',
                    extraBtnClass   : 'btn-new',
                    elementId       : '',
                    eventHandlers   : {
                        click: function () {
                            mod.importSelectedEpisodes(self.episodeTable.getSelectedRows(), self.episodeTable);
                        }
                    },
                    validateConstraints: function () {
                        // Only importable rows can be selected
                        return this.getSelectedRows().length >= 1;
                    }
                }
            };
        self.episodeTable = AIRTIME.podcast.initPodcastEpisodeDatatable(
            $scope.tab.contents.find('.podcast_episodes'),
            params,
            buttons,
            {
                hideIngestCheckboxes: true,
                podcastId: $scope.podcast.id
            }
        );
        self.reloadEpisodeTable();
        */
    };

    /**
     * Reload the podcast episode table.
     */
    PodcastController.prototype.reloadEpisodeTable = function() {
        this.episodeTable.reload();
    };

    /**
     * Initialize the controller.
     *
     * Sets up the internal datatable.
     */
    PodcastController.prototype.initialize = function() {
        var self = this;
        // TODO: this solves a race condition, but we should look for the root cause
        AIRTIME.tabs.onResize();
        self.$scope.tab.setName(self.$scope.podcast.title);
        self._initTable();
        // Add an onclose hook to the tab to remove the table object and the
        // import listener so we don't cause memory leaks.
        if (self.episodeTable) {
            self.$scope.tab.assignOnCloseHandler(function () {
                self.episodeTable.destroy();
                self.episodeTable = null;
                self.$scope.$destroy();
            });
        }
    };

    /**
     * StationPodcastController constructor.
     *
     * @param {angular.scope}   $scope          angular scope service object
     * @param {angular.http}    $http           angular http service object
     * @param {Object}          podcast         podcast metadata object
     * @param {int}             podcast.id      podcast unique identifier
     * @param {string}          podcast.title   podcast metadata title
     * @param {Tab}             tab             Tab object the controller is being bootstrapped in
     *
     * @constructor
     */
    function StationPodcastController($scope, $http, podcast, tab) {
        // Super call to parent controller
        PodcastController.call(this, $scope, $http, podcast, tab);
        // Store the station podcast tab in module scope so it can be checked if the user clicks the
        // Station Podcast button again - this way we don't have to go back to the server to get the ID.
        $stationPodcastTab = tab;

        /**
         * Override the tab close function to 'unset' the module-scope $stationPodcastTab.
         *
         * @override
         */
        tab.close = function () {
            AIRTIME.tabs.Tab.prototype.close.call(this);
            $stationPodcastTab = undefined;
        };

        return this;
    }

    /**
     * Subclass the PodcastController object.
     *
     * @type {PodcastController}
     */
    StationPodcastController.prototype = Object.create(PodcastController.prototype);

    /**
     * Remove the selected episodes from the station podcast feed.
     */
    StationPodcastController.prototype.unpublishSelectedEpisodes = function () {
        var self = this, $scope = self.$scope,
            episodes = self.episodeTable.getSelectedRows();
        jQuery.each(episodes, function () {
            self.$http.delete(endpoint + $scope.podcast.id + '/episodes/' + this.id + '?csrf_token=' + $scope.csrf)
                .success(function () {
                    self.reloadEpisodeTable();
                });
        });
    };

    /**
     * Open metadata editor tabs for each of the selected episodes.
     */
    StationPodcastController.prototype.openSelectedTabEditors = function () {
        mod.editSelectedEpisodes(this.episodeTable.getSelectedRows());
    };

    /**
     * Initialize the Station podcast episode table.
     *
     * @private
     */
    StationPodcastController.prototype._initTable = function() {
        var self = this, $scope = this.$scope,
            buttons = {
                editBtn: {
                    title           : $.i18n._('Edit Metadata'),
                    iconClass       : 'icon-pencil',
                    extraBtnClass   : '',
                    elementId       : '',
                    eventHandlers   : {
                        click: self.openSelectedTabEditors.bind(self)
                    },
                    validateConstraints: function () {
                        return this.getSelectedRows().length >= 1;
                    }
                },
                deleteBtn: {
                    title           : $.i18n._('Unpublish'),
                    iconClass       : 'icon-trash',
                    extraBtnClass   : 'btn-danger',
                    elementId       : '',
                    eventHandlers   : {
                        click: self.unpublishSelectedEpisodes.bind(self)
                    },
                    validateConstraints: function () {
                        return this.getSelectedRows().length >= 1;
                    }
                },
                slideToggle: {}
            },
            params = {
                sAjaxSource : endpoint + $scope.podcast.id + '/episodes',
                aoColumns: [
                    // TODO: it might be dangerous to use CcFiles here? We should alias this instead
                    /* Title */             { "sTitle" : $.i18n._("Title")             , "mDataProp" : "CcFiles.track_title"    , "sClass" : "podcast_episodes_title"       , "sWidth" : "170px" },
                    /* Description */       { "sTitle" : $.i18n._("Description")       , "mDataProp" : "CcFiles.description"    , "sClass" : "podcast_episodes_description" , "sWidth" : "300px" }
                ]
            };

        this.episodeTable = AIRTIME.podcast.initPodcastEpisodeDatatable(
            $scope.tab.contents.find('.podcast_episodes'),
            params,
            buttons,
            {
                hideIngestCheckboxes: true,
                podcastId: $scope.podcast.id
            }
        );
    };

    /**
     * Initialize the Station podcast.
     */
    StationPodcastController.prototype.initialize = function() {
        PodcastController.prototype.initialize.call(this);
        // We want to override the default tab name behaviour and use "Station Podcast" for clarity
        this.$scope.tab.setName(jQuery.i18n._("Station Podcast"));
    };

    /**
     * Reload the Station podcast episode table.
     *
     * @override
     */
    StationPodcastController.prototype.reloadEpisodeTable = function() {
        this.episodeTable.getDatatable().fnDraw();
    };

    /**
     * AngularJS app for podcast functionality.
     *
     * Bootstrapped for each podcast or Station podcast tab.
     */
    var podcastApp = angular.module('podcast', [])
        .controller('Podcast', ['$scope', '$http', 'podcast', 'tab', PodcastController])
        .controller('StationPodcast', ['$scope', '$http', 'podcast', 'tab', StationPodcastController]);

    /**
     * Implement bulk editing of podcasts in order to accommodate the existing selection
     * mechanisms on the frontend.
     *
     * Bulk methods use a POST request because we need to send data in the request body.
     *
     * @param selectedData the data to operate on
     * @param method HTTP request method type
     * @param callback function to run upon success
     * @private
     */
    function _bulkAction(selectedData, method, callback) {
        var ids = [];
        selectedData.forEach(function(el) {
            var uid = AIRTIME.library.MediaTypeStringEnum.PODCAST+"_"+el.id,
                t = AIRTIME.tabs.get(uid);
            if (t && method == HTTPMethods.DELETE) {
                t.close();
            }
            if (!(t && method == HTTPMethods.GET)) {
                ids.push(el.id);
            } else if (t != AIRTIME.tabs.getActiveTab()) {
                t.switchTo();
            }
        });

        if (ids.length > 0) {
            $.post(endpoint + "bulk", {csrf_token: $("#csrf").val(), method: method, ids: ids}, callback);
        }
    }

    /**
     * Bootstrap and initialize the Angular app for the podcast being opened.
     *
     * @param podcast podcast JSON object to pass to the angular app
     * @param tab Tab object the angular app will be initialized in
     * @private
     */
    function _bootstrapAngularApp(podcast, tab) {
        podcastApp.value('podcast', podcast);
        podcastApp.value('tab', tab);
        var wrapper = tab.contents.find(".angular_wrapper");
        angular.bootstrap(wrapper.get(0), ["podcast"]);
    }

    /**
     * Initialization function for a podcast tab.
     * Called when editing one or more podcasts.
     *
     * @param data JSON data returned from the server.
     *             Contains a JSON encoded podcast object and tab
     *             content HTML and has the following form:
     *             {
     *                 podcast: '{
     *                              ...
     *                          }'
     *                 html:    '<...>'
     *             }
     * @private
     */
    function _initAppFromResponse(data) {
        var podcast = JSON.parse(data.podcast),
            uid = AIRTIME.library.MediaTypeStringEnum.PODCAST+"_"+podcast.id,
            tab = AIRTIME.tabs.openTab(data.html, uid, null);
        _bootstrapAngularApp(podcast, tab);
    }

    /**
     * Initialize the PodcastTable subclass object (from Table).
     *
     * Do this in its own function to avoid unnecessary reinitialization of the object.
     *
     * @private
     */
    function _initPodcastEpisodeTable() {
        PodcastEpisodeTable = function(wrapperDOMNode, bItemSelection, toolbarButtons, dataTablesOptions, config) {
            this.config = config;  // Internal configuration object
            this._setupImportListener();
            // Call the superconstructor
            return AIRTIME.widgets.Table.call(this, wrapperDOMNode, bItemSelection, toolbarButtons, dataTablesOptions);
        };  // Subclass AIRTIME.widgets.Table
        PodcastEpisodeTable.prototype = Object.create(AIRTIME.widgets.Table.prototype);
        PodcastEpisodeTable.prototype.constructor = PodcastEpisodeTable;
        PodcastEpisodeTable.prototype._SELECTORS = Object.freeze({
            SELECTION_CHECKBOX: ".airtime_table_checkbox:has(input)",
            SELECTION_TABLE_ROW: "tr:has(td.airtime_table_checkbox > input)"
        });

        /**
         * @override
         *
         * Override the checkbox delegate function in the Table object to change
         * the row's checkbox and import status columns depending on the status
         * of the episode (unimported: 0, imported: 1, pending import: -1).
         *
         * @param rowData
         * @param callType
         * @param dataToSave
         *
         * @returns {string}
         * @private
         */
        PodcastEpisodeTable.prototype._datatablesCheckboxDataDelegate = function(rowData, callType, dataToSave) {
            var importIcon = "<span class='sp-checked-icon checked-icon imported-flag'></span>",
                pendingIcon = "<span class='loading-icon'></span>";
            if (this.config.hideIngestCheckboxes && rowData.ingested && rowData.ingested != 0) {
                return rowData.ingested > 0 ? importIcon : pendingIcon;
            }
            rowData.importIcon = (rowData.ingested != 0) ? (rowData.ingested > 0 ? importIcon : pendingIcon) : null;
            return AIRTIME.widgets.Table.prototype._datatablesCheckboxDataDelegate.call(this, rowData, callType, dataToSave);
        };

        /**
         * Reload the episode table.
         * Since we're sometimes using a static source, define a separate function to fetch and reload the table data.
         * We use this when we save the Podcast because we need to flag rows the user is ingesting.
         *
         * @param [id] optional podcast identifier
         */
        PodcastEpisodeTable.prototype.reload = function (id) {
            // When using static source data, we instantiate an empty table
            // and pass this function the ID of the podcast we want to display.
            if (id) this.config.podcastId = id;
            var self = this, dt = self._datatable;
            dt.block({
                message: "",
                theme: true,
                applyPlatformOpacityRules: false
            });
            $.get(endpoint + self.config.podcastId + '/episodes', function (json) {
                dt.fnClearTable();
                self.clearSelection();
                dt.fnAddData(JSON.parse(json));
                // dt.fnDraw();
            }).done(function () {
                dt.unblock();
            });
        };

        /**
         * Setup an interval that checks for any pending imports and reloads
         * the table once imports are finished.
         *
         * TODO: remember selection; make this more elegant?
         *
         * @private
         */
        PodcastEpisodeTable.prototype._setupImportListener = function () {
            var self = this;
            self.importListener = setInterval(function () {
                var podcastId = self.config.podcastId, pendingRows = [];
                if (!podcastId) return false;
                var dt = self.getDatatable(), data = dt.fnGetData();
                // Iterate over the table data to check for any rows pending import
                $.each(data, function () {
                    if (this.ingested == -1) {
                        pendingRows.push(this.guid);
                    }
                });
                if (pendingRows.length > 0) {
                    // Fetch the table data if there are pending rows,
                    // then check if any of the pending rows have
                    // succeeded or failed before reloading the table.
                    $.get(endpoint + podcastId + '/episodes', function (json) {
                        data = JSON.parse(json);
                        var delta = false;
                        $.each(data, function () {
                            var idx = pendingRows.indexOf(this.guid);
                            if (idx > -1 && this.ingested != -1) {
                                delta = true;
                                pendingRows.slice(idx, 0);
                            }
                        });
                        if (delta) {  // Has there been a change?
                            // We already have the data, so there's no reason to call
                            // reload() here; this also provides a smoother transition
                            dt.fnClearTable();
                            dt.fnAddData(data);
                        }
                    });
                }
            }, 10000);  // Run every 10 seconds
        };

        /**
         * Explicit destructor
         */
        PodcastEpisodeTable.prototype.destroy = function () {
            clearInterval(this.importListener);
        }
    }

    /**
     * Create and show the URL dialog for podcast creation.
     */
    mod.createUrlDialog = function () {
        $.get('/render/podcast-url-dialog', function(json) {
            $(document.body).append(json.html);
            $("#podcast_url_dialog").dialog({
                title: $.i18n._("Add New Podcast"),
                resizable: false,
                modal: true,
                width: '450px',
                height: 129
            });
        });
    };

    /**
     * Find the URL in the podcast creation dialog and POST it to the server
     * to store the feed as a Podcast object.
     *
     * FIXME: we should probably be passing the serialized form into this function instead
     */
    mod.addPodcast = function () {
        $.post(endpoint, $("#podcast_url_dialog").find("form").serialize(), function(json) {
            _initAppFromResponse(json);
            // Open the episode view for the newly created podcast in the left-hand pane
            AIRTIME.library.podcastEpisodeTableWidget.reload(JSON.parse(json.podcast).id);
            AIRTIME.library.podcastTableWidget.clearSelection();
            AIRTIME.library.setCurrentTable(AIRTIME.library.DataTableTypeEnum.PODCAST_EPISODES);
            $("#podcast_url_dialog").dialog("close");
        }).fail(function (e) {
            var errors = $("#podcast_url_dialog").find(".errors");
            errors.show(200).text(e.responseText);
            setTimeout(function () {
                errors.hide(200);
            }, 3000);
        });
    };

    /**
     * Open a tab to view and edit the station podcast.
     */
    mod.openStationPodcast = function () {
        if (typeof $stationPodcastTab === 'undefined') {
            $.get(endpoint + 'station', function(json) {
                _initAppFromResponse(json);
            });
        } else if ($stationPodcastTab != AIRTIME.tabs.getActiveTab()) {
            $stationPodcastTab.switchTo();
        }
    };

    /**
     * Create a bulk request to edit all currently selected podcasts.
     */
    mod.editSelectedPodcasts = function () {
        _bulkAction(AIRTIME.library.podcastTableWidget.getSelectedRows(), HTTPMethods.GET, function(json) {
            json.forEach(function(data) {
                _initAppFromResponse(data);
            });
        });
    };

    /**
     * Create a bulk request to delete all currently selected podcasts.
     */
    mod.deleteSelectedPodcasts = function () {
        if (confirm($.i18n._("Are you sure you want to delete the selected podcasts from your library?"))) {
            _bulkAction(AIRTIME.library.podcastTableWidget.getSelectedRows(), HTTPMethods.DELETE, function () {
                AIRTIME.library.podcastDataTable.fnDraw();
            });
        }
    };

    /**
     * Open metadata editor tabs for each of the selected episodes.
     *
     * @param {Array} episodes the array of selected episodes
     */
    mod.editSelectedEpisodes = function (episodes) {
        $.each(episodes, function () {
            if (this.file && !Object.keys(this.file).length > 0) return false;
            var fileId = this.file_id || this.file.id, uid = AIRTIME.library.MediaTypeStringEnum.FILE + "_" + fileId;
            $.get(baseUrl + "library/edit-file-md/id/" + fileId, {format: "json"}, function (json) {
                AIRTIME.playlist.fileMdEdit(json, uid);
            });
        });
    };

    /**
     * Import one or more podcast episodes.
     *
     * @param {Array} episodes          array of episode data to be imported
     * @param {PodcastEpisodeTable} dt  PodcastEpisode table containing the data
     */
    mod.importSelectedEpisodes = function (episodes, dt) {
        $.each(episodes, function () {
            if (this.enclosure.length > remainingDiskSpace) {
                alert("You don't have enough disk space to import " + this.title);
                return false;
            }
            if (this.file && Object.keys(this.file).length > 0) return false;
            var podcastId = this.podcast_id;
            $.post(endpoint + podcastId + '/episodes', JSON.stringify({
                csrf_token: $("#csrf").val(),
                episode: this
            }), function () {
                dt.reload(podcastId);
            });

            remainingDiskSpace -= this.enclosure.length;
        });
    };

    /**
     * Initialize the internal datatable for the podcast editor view to hold episode data passed back from the server.
     *
     * Selection for the internal table represents episodes marked for ingest and is disabled for ingested episodes.
     *
     * @param {jQuery}  domNode   the jQuery DOM node to create the table inside.
     * @param {Object}  params    JSON object containing datatables parameters to override
     * @param {Object}  buttons   JSON object containing datatables button parameters
     * @param {Object}  config    JSON object containing internal PodcastEpisodeTable parameters
     * @param {boolean} config.hideIngestCheckboxes flag denoting whether or not to hide checkboxes for ingested items
     *
     * @returns {Table} the created Table object
     */
    mod.initPodcastEpisodeDatatable = function (domNode, params, buttons, config) {
        if ('slideToggle' in buttons) {
            buttons = $.extend(true, {
                slideToggle: {
                    title: '',
                    iconClass: 'spl-no-r-margin icon-chevron-up',
                    extraBtnClass: 'toggle-editor-form',
                    elementId: '',
                    eventHandlers: {},
                    validateConstraints: function () { return true; }
                }
            }, buttons);
        }
        params = $.extend(true, params,
            {
                bDeferRender: true,
                oColVis: {
                    aiExclude: [0, 1],
                    oColReorder: {
                        iFixedColumns: 1  // Checkbox
                    }
                },
                fnCreatedRow: function(nRow, aData, iDataIndex) {
                    var self = this;
                    if (aData.file && Object.keys(aData.file).length > 0) {
                        $(nRow).draggable({
                            helper: function () {
                                var $row = $(this), data = self._datatable.fnGetData(nRow);
                                $row.data("aData", data.file);
                                self.selectRow(this, data, self.SELECTION_MODE.SINGLE, $row.index());
                                var selected = self.getSelectedRows().length, container,
                                    width = self._$wrapperDOMNode.closest(".dataTables_wrapper").outerWidth(), message;

                                message = sprintf($.i18n._(selected > 1 ? "Adding %s Items" : "Adding %s Item"), selected);
                                container = $('<div/>').attr('id', 'draggingContainer').append('<tr/>')
                                    .find("tr").append('<td/>').find("td")
                                    .attr("colspan", 100).width(width).css("max-width", "none")
                                    .addClass("ui-state-highlight").append(message).end().end();

                                return container;
                            },
                            tolerance: 'pointer',
                            cursor: 'move',
                            cursorAt: {
                                top: 20,
                                left: Math.floor(self._datatable.outerWidth() / 2)
                            },
                            distance: 25, // min-distance for dragging
                            connectToSortable: $("#show_builder_table, .active-tab .spl_sortable")
                        });
                    }
                }
            }
        );

        if (typeof PodcastEpisodeTable === 'undefined') {
            _initPodcastEpisodeTable();
        }

        var podcastEpisodesTableWidget = new PodcastEpisodeTable(
            domNode, // DOM node to create the table inside.
            true,    // Enable item selection
            buttons, // Toolbar buttons
            params,  // Datatables overrides.
            config   // Internal config
        );

        podcastEpisodesTableWidget.getDatatable().addTitles("td");
        return podcastEpisodesTableWidget;
    };

    return AIRTIME;
}(AIRTIME || {}));

$(document).ready(function() {
    $(document).on("submit", "#podcast_url_form", function (e) {
        e.preventDefault();
        AIRTIME.podcast.addPodcast();
    });
});