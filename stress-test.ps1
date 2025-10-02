# Краш-тест FastCGI сервера для Windows
# Убедитесь, что сервер запущен перед выполнением

$baseUrl = "http://localhost:29111/calculate"
$totalRequests = 100
$successCount = 0
$failCount = 0

Write-Host "🚀 Начинаем краш-тест сервера..." -ForegroundColor Cyan
Write-Host "📍 URL: $baseUrl" -ForegroundColor White
Write-Host "📊 Количество запросов: $totalRequests" -ForegroundColor White
Write-Host ""

# Массив тестовых данных
$testCases = @(
    '{"x":1,"y":1,"r":2}',
    '{"x":-1,"y":1,"r":2}',
    '{"x":-0.5,"y":-0.5,"r":2}',
    '{"x":0.5,"y":-0.5,"r":2}',
    '{"x":0,"y":0,"r":2}'
)

# Функция для отправки запроса
function Send-TestRequest {
    param(
        [string]$data
    )

    try {
        $response = Invoke-WebRequest -Uri $baseUrl `
            -Method POST `
            -ContentType "application/json" `
            -Body $data `
            -TimeoutSec 5

        $script:successCount++
        Write-Host "✅ Успех: $data" -ForegroundColor Green
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $script:failCount++

        if ($statusCode -eq 400 -or $statusCode -eq 500) {
            Write-Host "⚠️  Ожидаемая ошибка ($statusCode): $data" -ForegroundColor Yellow
        }
        else {
            Write-Host "❌ Ошибка ($statusCode): $data" -ForegroundColor Red
            Write-Host "   Сообщение: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Тест 1: Последовательные запросы
Write-Host "📋 Тест 1: Последовательные запросы..." -ForegroundColor Cyan
for ($i = 0; $i -lt $totalRequests; $i++) {
    $data = $testCases[$i % $testCases.Count]
    Send-TestRequest -data $data

    # Показываем прогресс каждые 10 запросов
    if (($i + 1) % 10 -eq 0) {
        Write-Host "   Прогресс: $($i + 1)/$totalRequests" -ForegroundColor Gray
    }
}
Write-Host ""

# Тест 2: Параллельные запросы
Write-Host "📋 Тест 2: Параллельные запросы (10 одновременно)..." -ForegroundColor Cyan
$jobs = @()
for ($i = 0; $i -lt 10; $i++) {
    $data = $testCases[$i % $testCases.Count]
    $jobs += Start-Job -ScriptBlock {
        param($url, $body)
        try {
            Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body -TimeoutSec 5
        }
        catch {
            $_.Exception
        }
    } -ArgumentList $baseUrl, $data
}

# Ждем завершения всех задач
$jobs | Wait-Job | ForEach-Object {
    $result = Receive-Job $_
    if ($result -is [Microsoft.PowerShell.Commands.WebResponseObject]) {
        $script:successCount++
        Write-Host "✅ Параллельный запрос успешен" -ForegroundColor Green
    }
    else {
        $script:failCount++
        Write-Host "❌ Параллельный запрос провален" -ForegroundColor Red
    }
    Remove-Job $_
}
Write-Host ""

# Тест 3: Некорректные данные
Write-Host "📋 Тест 3: Некорректные данные..." -ForegroundColor Cyan
$invalidCases = @(
    '{"x":10,"y":1,"r":2}',           # X вне диапазона
    '{"x":1,"y":10,"r":2}',           # Y вне диапазона
    '{"x":1,"y":1,"r":10}',           # R вне диапазона
    '{"x":"abc","y":1,"r":2}',        # X не число
    '{"x":1,"y":"xyz","r":2}',        # Y не число
    '{"invalid":"json"}',              # Неверный формат
    ''                                 # Пустой запрос
)

foreach ($data in $invalidCases) {
    try {
        $response = Invoke-WebRequest -Uri $baseUrl `
            -Method POST `
            -ContentType "application/json" `
            -Body $data `
            -TimeoutSec 5

        Write-Host "❌ Неожиданный успех для: $data" -ForegroundColor Red
        $script:failCount++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 400 -or $statusCode -eq 500) {
            Write-Host "✅ Корректно обработана ошибка: $data (код $statusCode)" -ForegroundColor Green
            $script:successCount++
        }
        else {
            Write-Host "❌ Неожиданный код ответа $statusCode для: $data" -ForegroundColor Red
            $script:failCount++
        }
    }
}
Write-Host ""

# Тест 4: Граничные значения
Write-Host "📋 Тест 4: Граничные значения..." -ForegroundColor Cyan
$boundaryCases = @(
    '{"x":-2,"y":4.9999,"r":1}',      # Граничные значения
    '{"x":2,"y":-2.9999,"r":3}',
    '{"x":0,"y":0,"r":1.5}',
    '{"x":-3,"y":1,"r":2}',           # Выход за границу X
    '{"x":1,"y":-3,"r":2}',           # Выход за границу Y
    '{"x":1,"y":5,"r":2}'             # Выход за границу Y
)

foreach ($data in $boundaryCases) {
    Send-TestRequest -data $data
}
Write-Host ""

# Тест 5: Быстрая последовательность
Write-Host "📋 Тест 5: Быстрая последовательность (20 запросов)..." -ForegroundColor Cyan
for ($i = 0; $i -lt 20; $i++) {
    Send-TestRequest -data '{"x":1,"y":1,"r":2}'
    Start-Sleep -Milliseconds 10
}
Write-Host ""

# Итоговая статистика
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 ИТОГОВАЯ СТАТИСТИКА" -ForegroundColor Yellow
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Успешных запросов: $successCount" -ForegroundColor Green
Write-Host "❌ Неудачных запросов: $failCount" -ForegroundColor Red
$total = $successCount + $failCount
if ($total -gt 0) {
    $successRate = [math]::Round(($successCount / $total) * 100, 2)
    Write-Host "📈 Процент успеха: $successRate%" -ForegroundColor Yellow
}
Write-Host "════════════════════════════════════" -ForegroundColor Cyan

# Сохранение результатов в файл
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "test-results_$timestamp.txt"
$results = @"
КРАШ-ТЕСТ СЕРВЕРА
Дата: $(Get-Date)
URL: $baseUrl

РЕЗУЛЬТАТЫ:
- Успешных: $successCount
- Неудачных: $failCount
- Процент успеха: $successRate%

ВЫПОЛНЕННЫЕ ТЕСТЫ:
1. Последовательные запросы: $totalRequests
2. Параллельные запросы: 10
3. Некорректные данные: $($invalidCases.Count)
4. Граничные значения: $($boundaryCases.Count)
5. Быстрая последовательность: 20
"@

$results | Out-File -FilePath $logFile -Encoding UTF8
Write-Host ""
Write-Host "💾 Результаты сохранены в файл: $logFile" -ForegroundColor Cyan