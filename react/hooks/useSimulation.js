import { useMemo } from 'react'
import { useQuery } from 'react-apollo'
import itemsWithSimulationQuery from 'vtex.store-resources/QueryItemsWithSimulation'

import useIsPriceAsync from './useIsPriceAsync'
import clone from '../utils/clone'

const mergeSellers = (sellerA, sellerB) => {
  const mergedSeller = clone(sellerA)

  mergedSeller.commertialOffer.Installments =
    sellerB.commertialOffer.Installments

  mergedSeller.commertialOffer.Price = sellerB.commertialOffer.Price
  mergedSeller.commertialOffer.ListPrice = sellerB.commertialOffer.ListPrice
  mergedSeller.commertialOffer.PriceValidUntil =
    sellerB.commertialOffer.PriceValidUntil

  return mergedSeller
}

const useSimulation = ({ product, inView, onComplete }) => {
  const { isPriceAsync } = useIsPriceAsync()

  const simulationItemsInput = useMemo(
    () =>
      product.items.map((item) => ({
        itemId: item.itemId,
        sellers: item.sellers.map((seller) => ({
          sellerId: seller.sellerId,
        })),
      })),
    [product]
  )

  useQuery(itemsWithSimulationQuery, {
    variables: {
      items: simulationItemsInput,
    },
    skip: !isPriceAsync || !inView,
    ssr: false,
    onCompleted: (response) => {
      const simulationItems = response.itemsWithSimulation

      const mergedProduct = clone(product)

      mergedProduct.items.forEach((item, itemIndex) => {
        const simulationItem = simulationItems[itemIndex]

        item.sellers = item.sellers.map((seller, simulationIndex) => {
          const sellerSimulation = simulationItem.sellers[simulationIndex]

          return mergeSellers(seller, sellerSimulation)
        })
      })

      mergedProduct.sku = mergedProduct.items.find(
        (item) => item.itemId === mergedProduct.sku.itemId
      )
      mergedProduct.sku.seller = mergedProduct.sku.sellers.find(
        (seller) => seller.sellerId === product.sku.seller.sellerId
      )
      mergedProduct.sku.image = product.sku.image

      onComplete(mergedProduct)
    },
  })
}

export default useSimulation
