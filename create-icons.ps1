$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$iconDir = "E:\Github\DNS_Shield\assets\icons"

Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$path)
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    
    $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($size, $size)),
        [System.Drawing.Color]::FromArgb(79, 70, 229),
        [System.Drawing.Color]::FromArgb(124, 58, 237)
    )
    
    $cornerRadius = [int]($size * 0.18)
    $pathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $pathObj.AddArc($rect.X, $rect.Y, $cornerRadius, $cornerRadius, 180, 90)
    $pathObj.AddArc($rect.Right - $cornerRadius, $rect.Y, $cornerRadius, $cornerRadius, 270, 90)
    $pathObj.AddArc($rect.Right - $cornerRadius, $rect.Bottom - $cornerRadius, $cornerRadius, $cornerRadius, 0, 90)
    $pathObj.AddArc($rect.X, $rect.Bottom - $cornerRadius, $cornerRadius, $cornerRadius, 90, 90)
    $pathObj.CloseFigure()
    $g.FillPath($gradient, $pathObj)
    
    $shieldColor = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
    $centerX = $size / 2
    $centerY = $size / 2
    $shieldSize = $size * 0.5
    
    $shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shieldPath.AddPolygon(@(
        (New-Object System.Drawing.PointF($centerX, $centerY - $shieldSize * 0.5)),
        (New-Object System.Drawing.PointF($centerX + $shieldSize * 0.4, $centerY - $shieldSize * 0.2)),
        (New-Object System.Drawing.PointF($centerX + $shieldSize * 0.4, $centerY + $shieldSize * 0.1)),
        (New-Object System.Drawing.PointF($centerX, $centerY + $shieldSize * 0.5)),
        (New-Object System.Drawing.PointF($centerX - $shieldSize * 0.4, $centerY + $shieldSize * 0.1)),
        (New-Object System.Drawing.PointF($centerX - $shieldSize * 0.4, $centerY - $shieldSize * 0.2))
    ))
    
    $shieldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 255, 255))
    $g.FillPath($shieldBrush, $shieldPath)
    
    $innerSize = $size * 0.25
    $innerX = $centerX - $innerSize / 2
    $innerY = $centerY - $innerSize / 2
    $g.FillEllipse($shieldBrush, $innerX, $innerY, $innerSize, $innerSize)
    
    $purpleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 79, 70, 229))
    $dotSize = $size * 0.08
    $g.FillEllipse($purpleBrush, $centerX - $dotSize / 2, $centerY - $dotSize / 2, $dotSize, $dotSize)
    
    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    
    Write-Host "Created: $path"
}

foreach ($size in $iconSizes) {
    $filename = "icon-${size}x${size}.png"
    $fullPath = Join-Path $iconDir $filename
    Create-Icon -size $size -path $fullPath
}

Write-Host "All icons created successfully!"
