<?php 
 /** 
  * Default view for an encrypted section.
  * Keep in mind, that initially an encrypted section is always locked! 
  */ 
?>
<div class="encryptedSection" data-encrypted="<?php echo escAttr(json_encode($encrypted)); ?>">
  <?php 
   /* old version with font-awesome icon
  
   <div class="ip" style="text-align: center">  <!-- need wrapper div for font-awewsome to work -->
     <span id="unlockSymbol" class="fa fa-lock fa-3x encUnlockSymbol" title=""></span> <!-- need title="" for jQueryUI.tooltip() to work *sic* -->
   </div>
   */ 
   ?>
  <div style="text-align: center">
    <img src="<? echo ipFileUrl('Plugin/EncryptedSection/Widget/EncryptedSectionWidget/assets/icon.svg'); ?>" alt="Encrypted Section Icon" title="Click to unlock" class="encUnlockSymbol">
  </div>
</div>