<div class="ip">
    <div id="AskForPasswordPopup" class="modal"> <!-- no class="fade". It's disctracting -->
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Enter password</h4>
                </div>
                <div class="modal-body">
                    <p>Please enter password to unlock this encrypted section:</p>
                    <p><input type="password" class="form-control" id="password" placeholder="Password"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default ipsCancel" data-dismiss="modal"><?php _e('Cancel', 'Ip-admin'); ?></button>
                    <button type="button" class="btn btn-primary ipsConfirm"><?php _e('Confirm', 'Ip-admin'); ?></button>
                </div>
            </div>
        </div>
    </div>
</div>
