require 'rails_watcher_viewer/web_app'

module RailsWatcherViewer

  def self.start path
    WebApp.path = path
    WebApp.run!
  end

end
