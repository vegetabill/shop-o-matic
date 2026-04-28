module Api
  module V1
    class ShoppingController < ApplicationController
      # POST /api/v1/households/:household_id/shopping/end
      def end
        purchased_item_ids = Array(params[:purchased_item_ids]).map(&:to_s)
        skipped_item_ids   = Array(params[:skipped_item_ids]).map(&:to_s).reject { |id| purchased_item_ids.include?(id) }
        store_id           = params[:store_id]
        store              = store_id.present? ? current_household.stores.find_by(id: store_id) : nil

        ActiveRecord::Base.transaction do
          valid_purchased = current_household.items.where(id: purchased_item_ids).pluck(:id)
          valid_skipped   = current_household.items.where(id: skipped_item_ids).pluck(:id)

          next if valid_purchased.empty? && valid_skipped.empty?

          trip = ShoppingTrip.create!(
            household: current_household,
            store: store,
            completed_at: Time.current
          )

          valid_purchased.each do |item_id|
            ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "purchased")
          end

          valid_skipped.each do |item_id|
            ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "skipped")
          end

          if valid_purchased.any?
            current_household.items
              .where(id: valid_purchased)
              .update_all(on_list: false, purchased_at: nil, updated_at: Time.current)
          end
        end

        render json: { message: "Shopping session recorded" }, status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end
    end
  end
end
