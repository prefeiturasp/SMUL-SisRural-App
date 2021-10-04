$RUBY_VERSION = "2.6.3.1"

Function DoesCommandExists {
	Param ($command)

	try { if(Get-Command $command -erroraction 'silentlycontinue'){ return $true } }
	catch { return $false }	
}

# https://docs.fastlane.tools/getting-started/android/setup/
"Settings environment variables LC_ALL and LANG"
[Environment]::SetEnvironmentVariable("LC_ALL", "en_US.UTF-8", "Machine")
[Environment]::SetEnvironmentVariable("LANG", "en_US.UTF-8", "Machine")

$hasInstalledChocolatey = DoesCommandExists choco
If ($hasInstalledChocolatey) {
	"Updating Chocolatey"
	choco upgrade chocolatey
} Else {
	"Installing Chocolatey"
	Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

$hasInstalledRuby = DoesCommandExists ruby
If ($hasInstalledRuby) {
	"Updating ruby"
	choco upgrade ruby --version $RUBY_VERSION -y
} Else {
	"Installing ruby"
	choco install ruby --version $RUBY_VERSION -y
	Write-Host "To finish the installation close the Powershell window and reopen it then rerun the script - (exit)" -ForegroundColor red
	Exit
}

"ridk install - denpendency for bundle install"
ridk install 1 2 3

$hasInstalledBundler = DoesCommandExists bundle
If ($hasInstalledBundler) {
	"Updating bundler"
	gem update bundler
} Else {
    "Installing bundler"
    gem install bundler
}

bundle install

Write-Host "You are ready to go" -ForegroundColor green


