
require 'openid'

class SessionController < ApplicationController

  layout 'server'


  def index
    response.headers['X-XRDS-Location'] = url_for(:controller => "server",
                                                  :action => "idp_xrds",
                                                  :only_path => false)
  end

  def login
    
    user = User.authenticate_safely(params[:user])

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
