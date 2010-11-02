
require 'openid'

class SessionController < ApplicationController

  layout 'server'


  def index
    response.headers['X-XRDS-Location'] = url_for(:controller => "server",
                                                  :action => "idp_xrds",
                                                  :only_path => false)
  end


  def create
    
    user = User.new(:username => params[:user][:username],
                      :password => Digest::MD5.hexdigest(params[:user][:password]),
					:email => params[:user][:email],
					:fullname => params[:user][:fullname])
    
    if user.save
      flash[:notice] = "Success! Your OpenID is:<br><a href='"<< openid_url(user.username) <<"'>"<< openid_url(user.username) <<"</a><br><br>Now login to an OpenID relying party such as <a href='http://www.livejournal.com/openid/'>http://www.livejournal.com/openid/</a>!"
    else
      flash[:error] = "Sorry, couldn't create user. Please try again."
    end
      
    redirect_to :action => 'index'
  end
  
  
  def login
    
    user = User.authenticate_safely(:user => params[:user][:username],
                      :password => Digest::MD5.hexdigest(params[:user][:password]))

    if user
      session[:username] = user.username
      session[:approvals] = []
    else
      flash[:error] = "Sorry, couldn't log in. Please try again."
    end
    
    redirect_to :action => 'index'
  end
  


  def logout
    # delete the username from the session hash
    session[:username] = nil
    session[:approvals] = nil
    
    redirect_to :action => 'index'
  end

end
