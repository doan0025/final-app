<?php
//delete.php
/*****************************************************
Deletes a full size and matching thumbnail image from the database as long as the device id matches

Requires 
$_REQUEST['dev'] - device unique id
$_REQUEST['img_id'] - the unique image id of the image to be removed from the database

Returns JSON
code should be zero if there is no error
The id parameter will be the unique image id from the database
{"code":0, "message": "Feedback message" }

if code is something else then there is an error 
{"code":423, "message":"error message for you" }
*****************************************************/

require_once("db.inc.php");
header("Content-Type: application/json");

if( isset( $_GET['dev'] ) && isset($_GET['img_id']) ){
    //we have the device id
    //delete the matching record
    $dev_id = trim($_GET['dev']);
    $img_id = intval($_GET['img_id']);
    
    $sql = "DELETE FROM w15_final WHERE device_id=? AND img_id=? LIMIT 1";
    $rs = $pdo->prepare($sql);
    $ret = $rs->execute( array($dev_id, $img_id) );
    if($ret){
        //just tell them it worked
        //but first check to see if a record was deleted
        
        echo '{"code":0, "message":"Successfully deleted image." }';
    }else{
        //failed to run query.... error
        $errorArray = $rs->errorInfo( );
        echo '{"code":543, "message":"Unable to delete the image from database at this time. SQL Error Code: ' . $errorArray[0] . '"}';
    }
        
}else{
    //no device id provided
    echo '{"code":423, "message":"Missing required parameter(s)"}';
}
exit();
$pdo = null;
?>