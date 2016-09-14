<?php
switch($_GET['change']) {
	case 'eurtousd':
	case 'sektousd':
	case 'noktousd':
	case 'dkktousd':
	case 'gbptousd':
	case 'krwtousd':
	case 'rontousd':
	case 'audtousd':
	case 'zartousd':
	case 'cadtousd':
	case 'rubtousd':
	case 'ilstousd':
	case 'plntousd':
	case 'chftousd':
	case 'cnytousd':
	case 'arstousd':
	case 'jpytousd':
	case 'hrktousd':
	case 'btctousd':
	case 'czktousd':
	case 'brltousd':
		$rates = json_decode(file_get_contents('json/' . $_GET['change'] . '.json'));
		$return = '{"rate":' . $rates->{$_GET['date']} .'}';
		echo htmlspecialchars($_GET['jsoncallback']) . '(' . $return . ')';
	break;
}