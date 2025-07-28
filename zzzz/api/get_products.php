<?php
header('Content-Type: application/json');
$products = [];
$baseDir = '../chanpin/';

foreach (glob($baseDir . '*', GLOB_ONLYDIR) as $folder) {
    $productName = basename($folder);
    $product = [
        'id' => md5($folder),
        'name' => $productName,
        'description' => '暂无描述',
        'specs' => '暂无规格',
        'price' => 0,
        'image' => ''
    ];

    // 查找图片
    foreach (['jpg', 'png', 'jpeg', 'webp'] as $ext) {
        $image = glob($folder . "/*.{$ext}")[0] ?? '';
        if ($image) {
            $product['image'] = str_replace('../', '', $image);
            break;
        }
    }

    // 读取产品信息
    $infoFile = $folder . '/info.txt';
    if (file_exists($infoFile)) {
        $lines = file($infoFile, FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            if (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', $line, 2);
                $key = strtolower(trim($key));
                $product[$key] = trim($value);
            }
        }
    }

    $products[] = $product;
}

echo json_encode($products);
?>