<?php
/**
 * Event handler for Encrypted Section Plugin
 * Add JavaScript and CSS files for normal view of encrypted section widget. 
 */
namespace Plugin\EncryptedSection;
 
class Event
{
    /**
     * add links to EncryptedSection.css and EncryptedSection JavaScript for view mode.
     * before the plugin's controller is loaded.
     */
    public static function ipBeforeController()
    {
        ipAddCss('Widget/EncryptedSectionWidget/assets/EncryptedSectionWidget.css');
        ipAddJs ('Widget/EncryptedSectionWidget/assets/EncryptedSectionView.js');
    }
 
}
