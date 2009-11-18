
require 'openid'

class SessionController < ApplicationController

  layout 'server'


  def index
    response.headers['X-XRDS-Location'] = url_for(:controller => "server",
                                                  :action => "idp_xrds",
                                                  :only_path => false)
  end


  def create
    
    logger.info(params[:user])
    
    user = User.new(:username => params[:user][:username],
                      :password => Digest::MD5.hexdigest(params[:user][:password]))
    
    if user.save
      flash[:notice] = "Success! Your OpenID is:<br><a href='"<< openid_url(user.username) <<"'>"<< openid_url(user.username) <<"</a><br><br>Now login to an OpenID enabled site such as <a href='http://www.livejournal.com/openid/'>http://www.livejournal.com/openid/</a>"
    else
      flash[:error] = "Sorry, couldn't create user. Try again."
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
      flash[:error] = "Sorry, couldn't log in. Try again."
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
