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

        render json: items.map { |item| item_json(item) }
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
          if store_ids.present?
            assign_stores(item, store_ids)
          end
        end

        item.reload
        render json: item_json(item), status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      # PUT /api/v1/households/:household_id/items/:id
      def update
        @item.updated_by_user = current_user

        store_ids = params[:store_ids]

        ActiveRecord::Base.transaction do
          @item.update!(item_params)
          if store_ids
            assign_stores(@item, store_ids)
          end
        end

        @item.reload
        render json: item_json(@item)
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message, details: e.record.errors.full_messages }, status: :unprocessable_entity
      end

      # POST /api/v1/households/:household_id/items/:id/add_to_list
      def add_to_list
        @item.add_to_list!
        render json: item_json(@item.reload)
      end

      # POST /api/v1/households/:household_id/items/:id/purchase
      def purchase
        @item.purchase!
        render json: item_json(@item.reload)
      end

      # POST /api/v1/households/:household_id/items/:id/unpurchase
      def unpurchase
        @item.unpurchase!
        render json: item_json(@item.reload)
      end

      # POST /api/v1/households/:household_id/items/:id/mark_unavailable
      def mark_unavailable
        @item.mark_unavailable!
        render json: item_json(@item.reload)
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
        # Validate all store_ids belong to this household
        valid_store_ids = current_household.stores.where(id: store_ids).pluck(:id)
        item.item_stores.destroy_all
        valid_store_ids.each do |store_id|
          item.item_stores.create!(store_id: store_id)
        end
      end

      def item_json(item)
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
          added_by_user_id: item.added_by_user_id,
          updated_by_user_id: item.updated_by_user_id,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      end
    end
  end
end
