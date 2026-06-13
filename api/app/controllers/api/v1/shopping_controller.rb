module Api
  module V1
    class ShoppingController < ApplicationController
      # GET /api/v1/households/:household_id/shopping/active
      def active
        trips = current_household.shopping_trips
          .where(completed_at: nil)
          .includes(:store, :shopping_trip_items)
          .order(created_at: :desc)

        render json: trips.map { |t| serialize_trip(t) }
      end

      # POST /api/v1/households/:household_id/shopping/pause
      def pause
        purchased_item_ids = Array(params[:purchased_item_ids]).map(&:to_s)
        skipped_item_ids   = Array(params[:skipped_item_ids]).map(&:to_s)
        store_id           = params[:store_id]
        trip_id            = params[:trip_id]
        store              = store_id.present? ? current_household.stores.find_by(id: store_id) : nil

        trip = nil
        ActiveRecord::Base.transaction do
          trip = trip_id.present? ? current_household.shopping_trips.find_by(id: trip_id, completed_at: nil) : nil
          trip ||= ShoppingTrip.create!(household: current_household, store: store)

          valid_purchased = current_household.items.where(id: purchased_item_ids).pluck(:id)
          valid_skipped   = current_household.items.where(id: skipped_item_ids).pluck(:id)

          trip.shopping_trip_items.delete_all

          valid_purchased.each { |item_id| ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "purchased") }
          valid_skipped.each   { |item_id| ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "skipped") }
        end

        render json: serialize_trip(trip.reload), status: :ok
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # POST /api/v1/households/:household_id/shopping/end
      def end
        purchased_item_ids = Array(params[:purchased_item_ids]).map(&:to_s)
        skipped_item_ids   = Array(params[:skipped_item_ids]).map(&:to_s).reject { |id| purchased_item_ids.include?(id) }
        store_id           = params[:store_id]
        trip_id            = params[:trip_id]
        store              = store_id.present? ? current_household.stores.find_by(id: store_id) : nil

        ActiveRecord::Base.transaction do
          valid_purchased = current_household.items.where(id: purchased_item_ids).pluck(:id)
          valid_skipped   = current_household.items.where(id: skipped_item_ids).pluck(:id)

          trip = trip_id.present? ? current_household.shopping_trips.find_by(id: trip_id, completed_at: nil) : nil

          if trip
            trip.shopping_trip_items.delete_all
            trip.update!(completed_at: Time.current)
          else
            next if valid_purchased.empty? && valid_skipped.empty?
            trip = ShoppingTrip.create!(
              household: current_household,
              store: store,
              completed_at: Time.current
            )
          end

          valid_purchased.each { |item_id| ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "purchased") }
          valid_skipped.each   { |item_id| ShoppingTripItem.create!(shopping_trip: trip, item_id: item_id, status: "skipped") }

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

      private

      def serialize_trip(trip)
        items = trip.shopping_trip_items.to_a
        {
          id: trip.id.to_s,
          store_id: trip.store_id&.to_s,
          store_name: trip.store&.name,
          store_color: trip.store&.color,
          purchased_item_ids: items.select { |i| i.status == "purchased" }.map { |i| i.item_id.to_s },
          skipped_item_ids: items.select { |i| i.status == "skipped" }.map { |i| i.item_id.to_s },
          created_at: trip.created_at.iso8601,
        }
      end
    end
  end
end
