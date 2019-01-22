<?php
/**
 * Navigation container (config/array)
 *
 * Each element in the array will be passed to
 * Zend_Navigation_Page::factory() when constructing
 * the navigation container below.
 *
 * The class field is used to contain the icon rendered
 * before the nav entry for i18n purposes. When this
 * gets parsed the language is not yet set and the
 * strings stay plain en for now. They get retranslated
 * in the menu.phtml script when they are output.
 */
$pages = array();
$pages[] = array(
    'label'      => _('My Podcast'),
    'module'     => 'default',
    'controller' => 'podcast',
    'action'     => 'station',
    'resource'   => 'podcast',
    'class'      => '<i class="icon-music icon-white"></i>'
);
$pages[] = array(
    'label'      => _('Radio Page'),
    'uri'        => '/',
    'resource'   => '',
    'class'      => '<i class="icon-globe icon-white"></i>',
    'pages'      => array(),
    'visible'    => false
);
$pages[] = array(
    'label'      => _('Calendar'),
    'module'     => 'default',
    'controller' => 'schedule',
    'action'     => 'index',
    'resource'   => 'schedule',
    'class'      => '<i class="icon-calendar icon-white"></i>'
);
$pages[] = array(
    'label'      => _('Widgets'),
    'module'     => 'default',
    'controller' => 'embeddablewidgets',
    'action'     => 'player',
    'resource'   => 'embeddablewidgets',
    'class'      => '<i class="icon-wrench icon-white"></i>',
    'title' => 'Widgets',
    'pages' => array(
        array(
            'label'      => _('Player'),
            'module'     => 'default',
            'controller' => 'embeddablewidgets',
            'action'     => 'player',
        ),
        array(
            'label'      => _('Weekly Schedule'),
            'module'     => 'default',
            'controller' => 'embeddablewidgets',
            'action'     => 'schedule',
        ),
        array(
            'label'      => _('Facebook'),
            'module'     => 'default',
            'controller' => 'embeddablewidgets',
            'action'     => 'facebook',
        )
    )
);
$pages[] = array(
    'label' => _("Settings"),
    'action' => 'edit-user',
    'module' => 'default',
    'controller' => 'user',
    'class' => '<i class="icon-cog icon-white"></i>',
    'title' => 'Settings',
    'pages' => array(
        array(
            'label'      => _('General'),
            'module'     => 'default',
            'controller' => 'preference',
	    'resource'   => 'preference'
        ),
        array(
            'label' => _('My Profile'),
            'controller' => 'user',
            'action' => 'edit-user'
        ),
        array(
            'label'      => _('Users'),
            'module'     => 'default',
            'controller' => 'user',
            'action'     => 'add-user',
            'resource'   => 'user'
        ),
        array(
            'label'      => _('Streams'),
            'module'     => 'default',
            'controller' => 'preference',
            'action'     => 'stream-setting',
	    'resource'   => 'preference'
        ),
        array(
            'label'      => _('Status'),
            'module'     => 'default',
            'controller' => 'systemstatus',
            'action'     => 'index',
            'resource'   =>    'systemstatus'
        ),
    )
);
$pages[] = array(
    'label'      => _("Analytics"),
    'module'     => 'default',
    'controller' => 'playouthistory',
    'action'     => 'index',
    'resource'   => 'playouthistory',
    'class'      => '<i class="icon-signal icon-white"></i>',
    'title' => 'Analytics',
    'pages' => array(
        array(
            'label'      => _('Playout History'),
            'module'     => 'default',
            'controller' => 'playouthistory',
            'action'     => 'index',
            'resource'   => 'playouthistory'
        ),
        array(
            'label'      => _('History Templates'),
            'module'     => 'default',
            'controller' => 'playouthistorytemplate',
            'action'     => 'index',
            'resource'   => 'playouthistorytemplate'
        ),
        array(
            'label'      => _('Listener Stats'),
            'module'     => 'default',
            'controller' => 'listenerstat',
            'action'     => 'index',
            'resource'   => 'listenerstat'
        ),
    )
);
if (LIBRETIME_ENABLE_BILLING === true) {
    $pages[] = array(
        'label' =>  (Application_Model_Preference::GetPlanLevel()=="trial") ? "<i class='icon-star icon-orange'></i><span style='color: #ff5d1a'>"._('Upgrade')."</span>" : "<i class='icon-briefcase icon-white'></i>"._('Billing'),
        'controller' => 'billing',
        'action' => 'upgrade',
        'resource' => 'billing',
        'title' => 'Billing',
        'pages' => array(
            array(
                'label' => _('Account Plans'),
                'module' => 'default',
                'controller' => 'billing',
                'action' => 'upgrade',
                'resource' => 'billing'
            ),
            array(
                'label' => _('Account Details'),
                'module' => 'default',
                'controller' => 'billing',
                'action' => 'client',
                'resource' => 'billing'
            ),
            array(
                'label' => _('View Invoices'),
                'module' => 'default',
                'controller' => 'billing',
                'action' => 'invoices',
                'resource' => 'billing'
            )
        )
    );
}
$pages[] = array(
    'label'      => _('Help'),
    'controller' => 'dashboard',
    'action'     => 'help',
    'resource'   => 'dashboard',
    'class'      => '<i class="icon-question-sign icon-white"></i>',
    'title'      => 'Help',
    'pages'      => array(
        array(
            'label'      => _('Getting Started'),
            'module'     => 'default',
            'controller' => 'dashboard',
            'action'     => 'help',
            'resource'   =>    'dashboard'
        ),
        array(
            'label'      => _('FAQ'),
            'uri'        => FAQ_URL,
            'target'     => "_blank"
        ),
        array(
            'label'      => _('User Manual'),
            'uri'        => USER_MANUAL_URL,
            'target'     => "_blank"
        ),
        array(
            'label'     => _('File a Support Ticket'),
            'uri'       => SUPPORT_TICKET_URL,
            'target'    => "_blank"
        ),
        array(
            'label'      => _(sprintf("Help Translate %s", PRODUCT_NAME)),
            'uri'        => AIRTIME_TRANSIFEX_URL,
            'target'     => "_blank"
        ),
        array(
            'label'     => _('What\'s New?'),
            'uri'       => LIBRETIME_WHATS_NEW_URL,
            'target'    => "_blank"
        )
    )
);


// Create container from array
$container = new Zend_Navigation($pages);
$container->id = "nav";

//store it in the registry:
Zend_Registry::set('Zend_Navigation', $container);