<?php

class Application_Common_HTTPHelper
{
    /**
     * Returns start and end DateTime vars from given 
     * HTTP Request object
     *
     * @param Request
     * @return array(start DateTime, end DateTime)
     */
    public static function getStartEndFromRequest($request)
    {
        return Application_Common_DateHelper::getStartEnd(
            $request->getParam("start", null),
            $request->getParam("end", null),
            $request->getParam("timezone", null)
        );
    }

    /**
     * Construct the base station URL
     *
     * @param boolean $secured whether or not to use HTTPS
     *
     * @return string the station URL
     */
    public static function getStationUrl($secured = true)
    {
        $CC_CONFIG = Config::getConfig();
        $baseUrl = $CC_CONFIG['baseUrl'];
        $baseDir = $CC_CONFIG['baseDir'];
        $basePort = $CC_CONFIG['basePort'];
        $forceSSL = $CC_CONFIG['forceSSL'];
        if (empty($baseDir)) {
            $baseDir = "/";
        }
        if ($baseDir[0] != "/") {
            $baseDir = "/" . $baseDir;
        }
        if (substr($baseDir, -1) != "/") {
            $baseDir = $baseDir . "/";
        }

        $scheme = "http";
        if ($forceSSL || ($secured && !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')) {
            $scheme = "https";
            $basePort = "443"; //Airtime Pro compatibility hack
        }

        $portStr = "";
        if (!(($scheme == "http" && $basePort == "80")
            || ($scheme == "https" && $basePort == "443"))) {
            $portStr = ":${basePort}";
        }
        $stationUrl = "$scheme://${baseUrl}${portStr}${baseDir}";

        return $stationUrl;
    }

    /**
     * Execute a cURL POST
     *
     * @param string $url       the URL to POST to
     * @param string[] $userPwd array of user args of the form ['user', 'pwd']
     * @param array $formData   array of form data kwargs
     *
     * @return mixed the cURL result
     */
    public static function doPost($url, $userPwd, $formData) {
        $params = "";
        foreach($formData as $key=>$value) {
            $params .= $key.'='.$value.'&';
        }
        rtrim($params, '&');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_USERPWD, implode(':', $userPwd));
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
    }
}

class ZendActionHttpException extends Exception {

    /**
     * @param Zend_Controller_Action $action
     * @param int                    $statusCode
     * @param string                 $message
     * @param int                    $code
     * @param Exception              $previous
     *
     * @throws Zend_Controller_Response_Exception
     */
    public function __construct(Zend_Controller_Action $action, $statusCode, $message,
                                $code = 0, Exception $previous = null) {
        Logging::error("Error in action " . $action->getRequest()->getActionName()
                      . " with status code $statusCode: $message");
        $action->getResponse()
            ->setHttpResponseCode($statusCode)
            ->appendBody($message);
        parent::__construct($message, $code, $previous);
    }

}
