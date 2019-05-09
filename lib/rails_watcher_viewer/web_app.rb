require 'sinatra/base'
require 'json'

module RailsWatcherViewer

  class WebApp < Sinatra::Application
    def self.path= path
      @@path = path
    end

    get '/' do
      page_size = 30
      count = 0
      requests = []
      now = Time.now
      Dir[File.join(@@path, "*")].sort_by{ |f| File.mtime(f) - now }.each do |request_folder|
        summary_file = File.join(request_folder, "summary.json")
        next unless File.exists? summary_file
        # data sample
        # {"duration":471.1509999997361,"request_path":"/","logged_time":"2019-04-09T22:59:36.749+08:00"}
        data = File.open(summary_file) { |f| JSON.parse(f.read) }
        requests << [data["logged_time"], data["request_path"], data["duration"], request_folder.sub(File.join(@@path).to_s + "/", "")]
      end
      @list = requests.reverse[0, 30]
      erb :list
    end

    get '/show/:folder' do
      %w[summary db_query_table method_call_table read_cache_table render_stack stack].each do |var|
        path = File.join @@path, params[:folder], "#{var}.json"
        json = File.open(path) { |f| f.read }
        value = JSON.parse(json)
        if var == "method_call_table"
          @method_call_table_json = json
        end
        instance_variable_set(:"@#{var}", value)
      end
      erb :detail
    end
  end

end
