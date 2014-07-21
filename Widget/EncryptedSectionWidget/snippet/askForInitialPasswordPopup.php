<div class="ip">
    <div id="AskForInitialPasswordPopup" class="modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h4 class="modal-title">Set initial password</h4>
                </div>
                <div class="modal-body">
                    <p>Please choose a new password for this encrypted section:</p>
                    <input type="password" class="form-control" id="password" placeholder="Password">
                    <input type="password" class="form-control" id="passwordCheck" placeholder="Type same password again">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default ipsCancel" data-dismiss="modal"><?php _e('Cancel', 'Ip-admin'); ?></button>
                    <button type="button" class="btn btn-primary ipsConfirm"><?php _e('Confirm', 'Ip-admin'); ?></button>
                </div>
            </div>
        </div>
    </div>
</div>