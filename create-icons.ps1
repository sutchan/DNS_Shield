$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$iconDir = "E:\Github\DNS_Shield\public\assets\icons"

Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$path)
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    
    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($size, $size)),
        [System.Drawing.Color]::FromArgb(79, 70, 229),
        [System.Drawing.Color]::FromArgb(124, 58, 237)
    )
    
    $cornerRadius = [int]($size * 0.18)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($gradientBrush, $rect)
    
    $shieldPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $size * 0.05)
    $shieldPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shieldPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    
    $centerX = $size / 2
    $centerY = $size / 2
    $shieldSize = $size * 0.4
    
    $shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shieldPath.AddPolygon(@(
        (New-Object System.Drawing.PointF($centerX, $centerY - $shieldSize * 0.5)),
        (New-Object System.Drawing.PointF($centerX + $shieldSize * 0.4, $centerY - $shieldSize * 0.2)),
        (New-Object System.Drawing.PointF($centerX + $shieldSize * 0.4, $centerY + $shieldSize * 0.2)),
        (New-Object System.Drawing.PointF($centerX, $centerY + $shieldSize * 0.5)),
        (New-Object System.Drawing.PointF($centerX - $shieldSize * 0.4, $centerY + $shieldSize * 0.2)),
        (New-Object System.Drawing.PointF($centerX - $shieldSize * 0.4, $centerY - $shieldSize * 0.2))
    ))
    
    $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)), $shieldPath)
    
    $dotSize = $size * 0.1
    $g.FillEllipse(
        (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(79, 70, 229))),
        $centerX - $dotSize / 2, 
        $centerY - $dotSize / 2, 
        $dotSize, 
        $dotSize
    )
    
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
