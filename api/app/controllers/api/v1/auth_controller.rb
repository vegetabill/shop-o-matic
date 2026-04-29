module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!

      # POST /api/v1/auth/auth0
      def auth0
        id_token = params[:id_token]

        return render json: { error: "id_token is required" }, status: :bad_request unless id_token.present?

        info = Auth0Service.verify(id_token)
        user = find_or_create_user(info)
        jwt = JwtService.token_for_user(user)

        render json: { token: jwt, user: user_json(user) }, status: :ok
      rescue Auth0Service::InvalidTokenError => e
        render json: { error: e.message }, status: :unauthorized
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: "Failed to create user account", details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def find_or_create_user(info)
        user = User.find_by(auth0_uid: info[:auth0_uid])

        if user
          user.update!(
            email: info[:email],
            name: info[:name],
            avatar_url: info[:avatar_url]
          )
        else
          user = User.create!(
            auth0_uid: info[:auth0_uid],
            email: info[:email],
            name: info[:name],
            avatar_url: info[:avatar_url]
          )
        end

        user
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url
        }
      end
    end
  end
end
