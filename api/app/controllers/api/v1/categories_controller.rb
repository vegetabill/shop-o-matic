module Api
  module V1
    class CategoriesController < ApplicationController
      before_action :set_category, only: [:update, :destroy]

      # GET /api/v1/households/:household_id/categories
      def index
        categories = current_household.categories.order(:name)
        render json: categories.map { |c| category_json(c) }
      end

      # POST /api/v1/households/:household_id/categories
      def create
        category = current_household.categories.build(category_params)

        if category.save
          render json: category_json(category), status: :created
        else
          render json: { error: "Failed to create category", details: category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/households/:household_id/categories/:id
      def update
        if @category.update(category_params)
          render json: category_json(@category)
        else
          render json: { error: "Failed to update category", details: @category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/households/:household_id/categories/:id
      def destroy
        @category.destroy!
        render json: { message: "Category deleted successfully" }, status: :ok
      end

      private

      def set_category
        @category = current_household.categories.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Category not found" }, status: :not_found
      end

      def category_params
        params.require(:category).permit(:name)
      end

      def category_json(category)
        {
          id: category.id,
          name: category.name,
          household_id: category.household_id,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end
    end
  end
end
