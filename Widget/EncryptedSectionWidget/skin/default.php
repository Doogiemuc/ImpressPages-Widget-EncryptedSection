<?php 
 /** 
  * Default view for an encrypted section.
  * Keep in mind, that initially an encrypted section is always locked! 
  */ 
?>
<div class="encryptedSection" 
 data-widgetdata="<?php echo escAttr(json_encode(array(
     "encrypted" => $encrypted,
     "salt" => $salt,
     "iv" => $iv,
     "numIterations" => $numIterations 
 ))); ?>">

 <?php 
   /* old version with font-awesome icon
  
   <div class="ip" style="text-align: center">  <!-- need wrapper div for font-awewsome to work -->
     <span id="unlockSymbol" class="fa fa-lock fa-3x encUnlockSymbol" title=""></span> <!-- need title="" for jQueryUI.tooltip() to work *sic* -->
   </div>
   */ 
   ?>

  <div style="text-align: center">
    <img src="<? echo ipFileUrl('Plugin/EncryptedSection/Widget/EncryptedSectionWidget/assets/icon.svg'); ?>" 
       alt="Encrypted Section Icon"
       title="Click to unlock" 
       class="encUnlockSymbol"
     />
  </div>
</div>





<!-- Bootstrap Modal (Popup) where user can enter a password to unlock an ecrypted section -->
<div class="ip">
    <div id="AskForPasswordPopup" class="modal" tabindex="-1" role="dialog" aria-labelledby="passwordModal" aria-hidden="true"> <!-- no class="fade". It's disctracting -->
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Enter password to unlock this Encrypted Section</h4>
                </div>
                <div class="modal-body">
                    <form role="form" id="passwordForm">
                        <div class="form-group">
                            <!-- <label class="control-label" for="password">Please enter password to unlock this encrypted section:</label> -->
                            <input type="password" class="form-control" name="password" placeholder="Password">
                            <div class="help-error">Password is wrong!</div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default"><?php _e('Cancel', 'Ip-admin');  ?></button>
                    <button type="button" class="btn btn-primary"><?php _e('Confirm', 'Ip-admin'); ?></button>
                </div>
            </div>
        </div>
    </div>
</div>
