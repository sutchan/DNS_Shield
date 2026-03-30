# 启动简单的HTTP服务器
Write-Host "启动HTTP服务器..."

# 使用Python的http.server模块（如果可用）
try {
    python -m http.server 8888
} catch {
    Write-Host "Python不可用，尝试其他方法..."
    
    # 使用Node.js的http模块（如果可用）
    try {
        node -e "
        const http = require('http');
        const fs = require('fs');
        const path = require('path');
        
        const server = http.createServer((req, res) => {
            let filePath = '.' + req.url;
            if (filePath === './') {
                filePath = './preview.html';
            }
            
            const extname = String(path.extname(filePath)).toLowerCase();
            const contentType = {
                '.html': 'text/html'
            }[extname] || 'application/octet-stream';
            
            fs.readFile(filePath, (error, content) => {
                if (error) {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });
        
        const PORT = 8888;
        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}/`);
        });
        "
    } catch {
        Write-Host "Node.js不可用，使用PowerShell HttpListener..."
        
        # 使用PowerShell的HttpListener
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add('http://localhost:8888/')
        $listener.Start()
        
        Write-Host "服务器已启动，监听 http://localhost:8888/"
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $path = $request.Url.LocalPath
            if ($path -eq '/') {
                $path = '/preview.html'
            }
            
            $filePath = Join-Path (Get-Location) $path.Substring(1)
            
            if (Test-Path $filePath -PathType Leaf) {
                $content = Get-Content -Path $filePath -Raw
                $response.ContentType = 'text/html'
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            
            $response.Close()
        }
    }
}
