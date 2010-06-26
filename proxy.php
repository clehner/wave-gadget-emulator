<?php
header("Content-type: application/xml");
if ($url = @$_GET["url"]) {
	$xml = @simplexml_load_file($url);
	if ($xml && $xml->xpath("/Module/Content")) {
		print $xml->asXML();
	}
}