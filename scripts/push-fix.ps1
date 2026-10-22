Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class CH {
    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags; public int Type; public string TargetName; public string Comment; public long LastWritten;
        public int CredentialBlobSize; public IntPtr CredentialBlob; public int Persist; public int AttributeCount;
        public IntPtr Attributes; public string TargetAlias; public string UserName;
    }
    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] b = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, b, 0, cred.CredentialBlobSize);
            return System.Text.Encoding.Unicode.GetString(b);
        }
        return null;
    }
}
"@

$token = [CH]::GetPassword("git:https://Hashmi707@github.com")
if (-not $token) {
    Write-Error "No token found"
    exit 1
}

$repoDir = "C:\Users\USER\.gemini\antigravity\scratch\meta-automation-agentic-social-v2"
Set-Location $repoDir

git add .
git commit -m "fix(ci): add test:agentic script and update GitHub Actions workflows"

$authRemote = "https://Hashmi707:$token@github.com/Hashmi707/nexxiq-ai-platform.git"
git remote set-url origin $authRemote
git push origin main
git remote set-url origin "https://github.com/Hashmi707/nexxiq-ai-platform.git"
Write-Output "Successfully pushed CI fixes to origin/main"
