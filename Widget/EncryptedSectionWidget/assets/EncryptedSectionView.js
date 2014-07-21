/**
 * Encrypted Section javascript for normal view (not in management mode)
 */
$(document).ready(function () {
    "use strict";

    if (ip.isManagementState) {
        console.log("isManagementState");
        return;
    }
    console.log("running");
    
    //TODO: wrap all this into a  $(".encUnlockSymbol").each(...); 
    
    var data = {
      encrypted: "My hardcoded secret"   
    };
    
    
    // jQueryUI tooltip for lock symbol
    $(".encUnlockSymbol").tooltip({
        content: data.encrypted ? "Click to unlock this section." : "Click to set initial password.",
        position: { my: "left center", at: "right+10 center"},
        hide: 0  // hide immideately, no fade
    });
   
    /*
    $(".encUnlockSymbol").click(
        $.proxy(unlockSection, this, null)
    );
    */
     
});
