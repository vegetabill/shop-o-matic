class Admin::ApplicationController < ActionController::Base
  before_action :authenticate_admin!

  layout "admin"
  helper_method :current_admin_user

  private

  def authenticate_admin!
    redirect_to admin_login_path, alert: "Please sign in." unless current_admin_user
  end

  def current_admin_user
    @current_admin_user ||= begin
      user = User.find_by(id: session[:admin_user_id])
      user if user&.admin?
    end
  end
end
