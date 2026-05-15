# Update item page to remove user auth
$itemPath = "src/app/item/[id]/page.tsx"
$itemContent = Get-Content $itemPath -Raw
$itemContent = $itemContent -replace "const { collectedIds, toggle, user } = useCollection\(\);", "const { collectedIds, toggle } = useCollection();"
$itemContent = $itemContent -replace "if \(!user\) { window.location.href = `/signin\?redirect=/item/\`\$\{id\}\`\`; return; }", ""
$itemContent = $itemContent -replace "const supabase = getSupabaseBrowser\(\);.*?const { data } = await supabase.*?setUserItem\(data \?\? null\);", "setUserItem(null);"
Set-Content $itemPath $itemContent

# Update missing page
$missingPath = "src/app/missing/page.tsx"
$missingContent = Get-Content $missingPath -Raw
$missingContent = $missingContent -replace "const { collectedIds, toggle, user } = useCollection\(\);", "const { collectedIds, toggle } = useCollection();"
$missingContent = $missingContent -replace "export default function MissingPage\(\) {.*?const { user } = useCollection\(\);", "export default function MissingPage() {"
Set-Content $missingPath $missingContent

Write-Host "Updated item and missing pages"
