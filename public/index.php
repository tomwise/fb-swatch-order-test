<?php

$location = 'data/';

$brands = array (
  array(
      "brandKey" => "rm",
      "config" => array(
          array(
            "mbox" => "Swatch_Order_RM_Tops",
            "file" => "RM_Tops_Top100_colors.json",
          ),
          array(
            "mbox" => "Swatch_Order_RM_Dresses",
            "file" => "RM_Dresses_Top100_colors.json",
          )
      ),
  ),
  array(
      "brandKey" => "ww",
      "config" => array(
          array(
            "mbox" => "Swatch_Order_WW_Tops",
            "file" => "WW_Tops_Top100_colors.json",
          ),
          array(
            "mbox" => "Swatch_Order_WW_Bottoms",
            "file" => "WW_Bottoms_Top100_colors.json",
          ),
          array(
            "mbox" => "Swatch_Order_WW_Dresses",
            "file" => "WW_Dresses_Top100_colors.json",
          )
      ),
  )
);

class jsonParent
{
    public $mbox;
    public $data;
}
$js_code = file_get_contents('controller-js.js', true);
foreach ($brands as &$brand) {
  $brandConfig = array();
  
  foreach ($brand['config'] as &$config) {
    $file = file_get_contents($location.$config['file'], true);
    $file = trim(preg_replace('/\s\s+/', ' ', $file));
    $json = new jsonParent;
    $json->mbox = $config['mbox'];
    $json->data = json_decode($file, true);
    array_push($brandConfig, $json);
  }

  $output = '<script>';
  $output .= "\r\n\r\n".'// Version Controlled - Do Not Modify Directly';
  $output .= "\r\n\r\nwindow.swatchJSON = ".json_encode($brandConfig).";\r\n\r\n";
  $output .= $js_code;
  $output .= "\r\n\r\n</script>";

  $fileOutputBrand = fopen("../dist/".$brand['brandKey']."-controller.html", "w");
  fwrite($fileOutputBrand, $output);
  
  echo $output;


 
}


?>