class User < ActiveRecord::Base
  
  def self.authenticate_safely(user)
    find(:first, :conditions => { :username => user[:username], :password => user[:password] })
  end
    
    
end
