<?php
/**
 * PHP controller for the Encrypted Section Widget.
 * There is not much to see here, since most of the widget logic is run on the client in javascript.
 * See EncryptedSectionWidget/assets/EncryptedSectionWidget.js  for more details.
 * 
 * @package ImpressPages
 */
namespace Plugin\EncryptedSection\Widget\EncryptedSectionWidget;


class Controller extends \Ip\WidgetController{

    /** return title for Encrypted Section */
    public function getTitle() {
        return __('Encrypted Section', 'ipAdmin');
    }

    /** initially an Encrypted Section is locked and has no content. */
    public function defaultData() {
        return array("encrypted" => "");
    }

}