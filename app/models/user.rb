class User < ActiveRecord::Base
  
  def self.authenticate_safely(user)
    @cache = find(:first, :conditions => { :username => user[:username], :password => user[:password] })
	@cache
  end
    
	def self.authenticated()
		@cache
	end
	
end
