module Api
  module V1
    class HouseholdsController < ApplicationController
      # GET /api/v1/households
      def index
        households = current_user.households.order(:name)
        render json: households.map { |h| household_json(h) }
      end

      # POST /api/v1/households
      def create
        household = Household.new(household_params)

        ActiveRecord::Base.transaction do
          household.save!
          household.household_memberships.create!(user: current_user)
          household.seed_defaults!
        end

        render json: household_json(household), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      # GET /api/v1/households/:id
      def show
        render json: household_json(current_household)
      end

      # POST /api/v1/households/join
      def join
        code = (params[:join_code] || params[:share_token]).to_s.strip.upcase

        unless code.present?
          return render json: { error: "join_code is required" }, status: :bad_request
        end

        household = Household.find_by(share_token: code)

        unless household
          return render json: { error: "No household found with that code" }, status: :not_found
        end

        if current_user.households.include?(household)
          return render json: { error: "You are already a member of this household" }, status: :unprocessable_entity
        end

        ActiveRecord::Base.transaction do
          household.household_memberships.create!(user: current_user)
          household.seed_defaults!
        end

        render json: household_json(household), status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      private

      def household_params
        params.require(:household).permit(:name)
      end

      def household_json(household)
        {
          id: household.id,
          name: household.name,
          share_token: household.share_token,
          member_count: household.household_memberships.size,
          created_at: household.created_at,
          updated_at: household.updated_at
        }
      end
    end
  end
end
