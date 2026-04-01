Add-Type -AssemblyName System.Drawing
$img1 = [System.Drawing.Image]::FromFile("C:\Users\HP\.gemini\antigravity\brain\30da8f4d-7953-43f0-a702-503a058f73af\media__1774289024410.jpg")
$img1.Save("c:\Users\HP\Desktop\images bbc\Camera\BBC OFFICIAL\me.omg16\jec-resolve-app.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img1.Dispose()

Copy-Item "C:\Users\HP\.gemini\antigravity\brain\30da8f4d-7953-43f0-a702-503a058f73af\media__1774289064067.png" -Destination "c:\Users\HP\Desktop\images bbc\Camera\BBC OFFICIAL\me.omg16\door-lock.png" -Force
Copy-Item "C:\Users\HP\.gemini\antigravity\brain\30da8f4d-7953-43f0-a702-503a058f73af\media__1774289071234.png" -Destination "c:\Users\HP\Desktop\images bbc\Camera\BBC OFFICIAL\me.omg16\hygiene.png" -Force
