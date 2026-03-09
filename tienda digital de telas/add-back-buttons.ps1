# Script para agregar BackButton a todas las páginas del admin que aún no lo tienen

$pagesNeedingBackButton = @(
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Analytics\ReturnsAnalysis.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Analytics\RotationRanking.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Analytics\SalesHeatMap.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Support\CouponCreation.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Support\TicketManagement.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Vetting\ApprovalQueue.jsx",
    "c:\Users\Anderson Moreno\tienda digital de telas\src\pages\admin\Vetting\VendorPerformance.jsx"
)

foreach ($filePath in $pagesNeedingBackButton) {
    if (Test-Path $filePath) {
        $content = Get-Content -Path $filePath -Raw
        
        # Check if BackButton is already imported
        if ($content -notmatch "import BackButton") {
            # Add BackButton import after DashboardLayout import
            $content = $content -replace "(import DashboardLayout from [^;]+;)", "`$1`nimport BackButton from '../../../components/dashboard/BackButton';"
            
            # Add <BackButton /> component after opening DashboardLayout tag
            $content = $content -replace "(\s+return \(\s+<DashboardLayout[^>]+>)", "`$1`n            <BackButton />"
            
            # Save the modified content
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Added BackButton to: $filePath"
        } else {
            Write-Host "⊙ BackButton already exists in: $filePath"
        }
    } else {
        Write-Host "✗ File not found: $filePath"
    }
}

Write-Host "`nAll files processed!"
