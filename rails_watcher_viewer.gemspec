$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "rails_watcher_viewer/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "rails_watcher_viewer"
  s.version     = RailsWatcherViewer::VERSION
  s.authors     = ["piecehealth"]
  s.email       = ["piecehealth@sina.com"]
  s.homepage    = "https://github.com/piecehealth/rails_watcher_viewer"
  s.summary     = "Default viewer for Rails Watcher."
  s.description = "Default viewer for Rails Watcher."
  s.license     = "MIT"

  s.executables << 'rails_watcher_viewer'

  s.files = Dir["lib/**/*", "MIT-LICENSE", "README.md"]

  s.add_dependency "sinatra", "2.0.5"
end
