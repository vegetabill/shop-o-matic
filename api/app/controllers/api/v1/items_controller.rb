module Api
  module V1
    class ItemsController < ApplicationController
      before_action :set_item, only: [:update, :add_to_list, :purchase, :unpurchase, :mark_unavailable]

      # GET /api/v1/households/:household_id/items
      # Params:
      #   ?on_list=true  — only items on the list
      #   ?q=search      — search by name (for autocomplete)
      def index
        items = current_household.items
          .includes(:category, :stores)
          .order(:name)

        if params[:on_list].present?
          on_list_val = ActiveModel::Type::Boolean.new.cast(params[:on_list])
          items = items.where(on_list: on_list_val)
        end

        if params[:q].present?
          items = items.search(params[:q])
        end

        last_purchases = batch_last_purchases(items.map(&:id))
        render json: items.map { |item| item_json(item, last_purchases[item.id]) }
      end

      # POST /api/v1/households/:household_id/items
      def create
        item = current_household.items.build(item_params)
        item.on_list = true
        item.added_by_user = current_user
        item.updated_by_user = current_user

        store_ids = params[:store_ids]

        ActiveRecord::Base.transaction do
          item.save!
          assign_stores(item, store_ids) if store_ids.present?
        end

        item.reload
        render json: item_json(item, last_purchase_for(item)), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      # PUT /api/v1/households/:household_id/items/:id
      def update
        @item.updated_by_user = current_user

        store_ids = params[:store_ids]

        ActiveRecord::Base.transaction do
          @item.update!(item_params)
          assign_stores(@item, store_ids) if store_ids
        end

        @item.reload
        render json: item_json(@item, last_purchase_for(@item))
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      # POST /api/v1/households/:household_id/items/:id/add_to_list
      def add_to_list
        @item.add_to_list!
        render json: item_json(@item.reload, last_purchase_for(@item))
      end

      # POST /api/v1/households/:household_id/items/:id/purchase
      def purchase
        @item.purchase!
        render json: item_json(@item.reload, last_purchase_for(@item))
      end

      # POST /api/v1/households/:household_id/items/:id/unpurchase
      def unpurchase
        @item.unpurchase!
        render json: item_json(@item.reload, last_purchase_for(@item))
      end

      # POST /api/v1/households/:household_id/items/:id/mark_unavailable
      def mark_unavailable
        @item.mark_unavailable!
        render json: item_json(@item.reload, last_purchase_for(@item))
      end

      private

      def set_item
        @item = current_household.items.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Item not found" }, status: :not_found
      end

      def item_params
        params.require(:item).permit(:name, :notes, :category_id, :on_list, :priority)
      end

      def assign_stores(item, store_ids)
        valid_store_ids = current_household.stores.where(id: store_ids).pluck(:id)
        item.item_stores.destroy_all
        valid_store_ids.each { |sid| item.item_stores.create!(store_id: sid) }
      end

      def last_purchase_for(item)
        batch_last_purchases([item.id])[item.id]
      end

      def batch_last_purchases(item_ids)
        return {} if item_ids.empty?

        rows = ShoppingTripItem
          .joins(:shopping_trip)
          .joins("LEFT JOIN stores ON stores.id = shopping_trips.store_id")
          .where(shopping_trip_items: { item_id: item_ids, status: "purchased" })
          .select("DISTINCT ON (shopping_trip_items.item_id) shopping_trip_items.item_id, shopping_trips.completed_at AS purchased_at, stores.name AS store_name")
          .order("shopping_trip_items.item_id, shopping_trips.completed_at DESC")

        rows.each_with_object({}) do |row, h|
          h[row.item_id] = { purchased_at: row.purchased_at, store_name: row.store_name }
        end
      end

      def item_json(item, last_purchase = nil)
        {
          id: item.id,
          name: item.name,
          notes: item.notes,
          priority: item.priority,
          on_list: item.on_list,
          purchased: item.purchased_at.present?,
          purchased_at: item.purchased_at,
          household_id: item.household_id,
          category_id: item.category_id,
          category_name: item.category&.name,
          stores: item.stores.map { |s| { store_id: s.id, store_name: s.name, store_color: s.color } },
          last_purchased_at: last_purchase&.[](:purchased_at),
          last_purchased_store_name: last_purchase&.[](:store_name),
          added_by_user_id: item.added_by_user_id,
          updated_by_user_id: item.updated_by_user_id,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      end
    end
  end
end
