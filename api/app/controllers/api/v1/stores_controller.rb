module Api
  module V1
    class StoresController < ApplicationController
      before_action :set_store, only: [:update, :destroy]

      # GET /api/v1/households/:household_id/stores
      def index
        stores = current_household.stores.order(:name)
        render json: stores.map { |s| store_json(s) }
      end

      # POST /api/v1/households/:household_id/stores
      def create
        store = current_household.stores.build(store_params)

        if store.save
          render json: store_json(store), status: :created
        else
          render json: { error: "Failed to create store", details: store.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/households/:household_id/stores/:id
      def update
        if @store.update(store_params)
          render json: store_json(@store)
        else
          render json: { error: "Failed to update store", details: @store.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/households/:household_id/stores/:id
      def destroy
        @store.destroy!
        render json: { message: "Store deleted successfully" }, status: :ok
      end

      private

      def set_store
        @store = current_household.stores.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Store not found" }, status: :not_found
      end

      def store_params
        params.require(:store).permit(:name, :color)
      end

      def store_json(store)
        {
          id: store.id,
          name: store.name,
          color: store.color,
          household_id: store.household_id,
          created_at: store.created_at,
          updated_at: store.updated_at
        }
      end
    end
  end
end
