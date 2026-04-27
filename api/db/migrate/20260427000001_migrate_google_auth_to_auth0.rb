class MigrateGoogleAuthToAuth0 < ActiveRecord::Migration[8.0]
  def change
    rename_column :users, :google_uid, :auth0_uid
    rename_column :users, :google_avatar_url, :avatar_url
  end
end
