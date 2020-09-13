import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'

const useIsPriceAsync = () => {
  const { searchQuery } = useSearchPage()

  return {
    isPriceAsync: Boolean(
      searchQuery?.variables?.simulationBehavior === 'async'
    ),
  }
}

export default useIsPriceAsync
