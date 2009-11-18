
module ServerHelper

  def url_for_user
    openid_url(session[:username])
  end
  
end

