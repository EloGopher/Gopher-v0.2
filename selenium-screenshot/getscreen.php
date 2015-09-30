<?php
   if ($_POST["job"]=="startscreenshots") {
      // where are we posting to?
      $url = 'http://192.168.1.201/setscreenjob.php';

      $keystring = bin2hex(openssl_random_pseudo_bytes(10));

      // what post fields?
      $fields = array(
         'urltoget' => $_POST["urltoget"],
         'resolution' => $_POST["screensize"],
         'jobid' => $keystring,
         'timeoutmsec' => '45000'
      );

      // build the urlencoded data
      $postvars = http_build_query($fields);

      // open connection
      $ch = curl_init();

      // set the url, number of POST vars, POST data
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, count($fields));
      curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      // execute post
      $result = curl_exec($ch);

      // close connection
      curl_close($ch);


      header('Content-Type: application/json');
      //echo json_encode($result);

      echo json_encode(array('requestid' => $keystring, 'requesturl' => $_POST["urltoget"], 'permalink' => 'http://'.$_SERVER['SERVER_NAME'].'/?jobid='.$keystring, 'postresult' => $result));
   } else

   if ($_POST["job"]=="queryscreenshots") {

      $url = 'http://192.168.1.201/getdonescreens.php';
   //   echo $url;

      // what post fields?
      $fields = array(
         'jobid' => $_POST["jobid"]
      );

      // build the urlencoded data
      $postvars = http_build_query($fields);

      // open connection
      $ch = curl_init();

      // set the url, number of POST vars, POST data
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_POST, count($fields));
      curl_setopt($ch, CURLOPT_POSTFIELDS, $postvars);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

      // execute post
      $result = curl_exec($ch);

      // close connection
      curl_close($ch);


      header('Content-Type: application/json');
      //echo json_encode($result);

      echo $result;
   }
?>
