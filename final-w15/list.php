<?php
//list.php
/*****************************************************
Returns a list of thumbnail images to be displayed as img tags or on canvas tags based on the unique device id
org.apache.cordova.device plugin should be used to fetch the unique device id

Database table structure
mad9022.w15_final
img_id INT Primary Key Autoincrement unsigned,
device_id VARCHAR(40),
thumbnail TEXT,
full_img TEXT



Requires 
$_REQUEST['dev'] - device unique id

Returns JSON
code should be zero if there is no error
{"code":0, "message": "Feedback message", "thumbnails":[
 {"id":1, "thumb": "base 64 string for the image"},
 {"id":2, "thumb": "base 64 string for the image"},
 {"id":3, "thumb": "base 64 string for the image"},
 {"id":4, "thumb": "base 64 string for the image"},
 {"id":5, "thumb": "base 64 string for the image"}
]}

if code is something else then there is an error and no thumbnails array
{"code":423, "message":"error message for you" }
*****************************************************/
error_reporting(E_ALL);

require_once("db.inc.php");
header("Content-Type: application/json");

if( isset( $_GET['dev'] ) ){
    //we have the device id
    //Retrieve matching records for device
    $dev_id = trim($_GET['dev']);
    
    $sql = "SELECT img_id, thumbnail FROM w15_final WHERE device_id=?";
   
    $rs = $pdo->prepare($sql);
    $ret = $rs->execute( array($dev_id) );
    if($ret){
        echo '{"code":0, "message":"Success", "thumbnails":[';
        $imgItems = array();
        while($row = $rs->fetch()){
            $imgitem = '{"id":' . $row['img_id'] . ', "data":"'. $row['thumbnail'] .'"}';
            $imgItems[] = $imgitem;
        }
        echo implode(",", $imgItems);
        //the array may be empty. That is why the [ ]  are outside the loop
        echo ']}';
    }else{
        //failed to run query.... error
        $errorArray = $rs->errorInfo( );
        echo '{"code":543, "message":"Unable to fetch data from database at this time. SQL ErrorCode: ' . $errorArray[0] . '"}';
    }
    
}else{
    //no device id provided
    echo '{"code":423, "message":"Missing required parameter(s)"}';
}

exit();
$pdo = null;

?>