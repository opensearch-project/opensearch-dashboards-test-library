export class TestFixtureHandler {

  constructor(inputTestRunner, openSearchUrl = 'localhost:9200') {
      this.testRunner = inputTestRunner;
      this.openSearchUrl = openSearchUrl;
  }
  
  /**
   * Read indices from a file and send to OpenSearch using the create index API
   * @param {String} filename File path (with its root at the directory containing the cypress.json file)
   */
  importJSONMapping(filename) {
    const parseIndex = ({ index, settings, mappings, aliases }) => {
    return { index, body: { settings, mappings, aliases } }
    }

    this.testRunner.readFile(filename, 'utf8').then((str) => {
      const strSplit = str.split('\n\n')
      strSplit.forEach((element) => {
        const json = JSON.parse(element)
        if (json.type === 'index') {
          const indexContent = parseIndex(json.value)
          this.testRunner.request({ method: 'PUT', url: `${this.openSearchUrl}/${indexContent.index}`, body: indexContent.body, failOnStatusCode: false }).then((response) => {
  
          })
        }
      })
    })
  }

  /**
   * Read indices from a file and request for them to be deleted from OpenSearch using the delete index API
   * @param {String} filename File path (with its root at the directory containing the cypress.json file)
   */
  clearJSONMapping(filename) {
    this.testRunner.readFile(filename, 'utf8').then((str) => {
      const strSplit = str.split('\n\n')
      strSplit.forEach((element) => {
          const json = JSON.parse(element)
          if (json.type === 'index') {
            const index = json.value.index
            this.testRunner.request({ method: 'DELETE', url: `${this.openSearchUrl}/${index}`, failOnStatusCode: false }).then((response) => {
            })
          }
      })
    })
  }

  /**
   * Read docs from a file and import them to OpenSearch using the bulk API
   * @param {String} filename File path (with its root at the directory containing the cypress.json file)
   * @param {Number} bulkMax Maximum number of combined action and source NDJSONs to send in one bulk API request
   */
  importJSONDoc(filename, bulkMax = 1600) {
    const parseDocument = ({ value: { id, index, source } }) => {
      const actionData = { index: { _id: id, _index: index } }
      const oneLineAction = JSON.stringify(actionData).replace('\n', '')
      const oneLineSource = JSON.stringify(source).replace('\n', '')
      const bulkOperation = `${oneLineAction}\n${oneLineSource}`
      return bulkOperation
    }
  
    const sendBulkAPIRequest = (bodyArray, openSearchUrl) => {
      this.testRunner.request({ headers: { 'Content-Type': 'application/json' }, method: 'POST', url: `${openSearchUrl}/_bulk`, body: `${bodyArray.join('\n')}\n`, timeout: 30000 }).then((response) => {
  
      })
    }

    this.testRunner.readFile(filename, 'utf8').then((str) => {
      let readJSONCount = 0
      const bulkLines = [[]]
      str.split('\n\n').forEach((element) => {
        bulkLines[0].push(parseDocument(JSON.parse(element)))
  
        readJSONCount++
        if (readJSONCount % bulkMax === 0) {
          sendBulkAPIRequest(bulkLines.pop(), this.openSearchUrl)
          bulkLines.push([])
        }
      })
  
      if (bulkLines.length > 0) {
        sendBulkAPIRequest(bulkLines.pop(), this.openSearchUrl)
      }
  
      this.testRunner.request({ method: 'POST', url: `${this.openSearchUrl}/_all/_refresh` }).then((response) => {
  
      })
    })
  }

  /**
   * Read docs from a file and import them to OpenSearch only when the indices do not already exist
   * in order to optimize the data uploading time
   * @param {string, array} index An index or a set of indices 
   * @param {string} indexMappingPath File path for mapping data
   * @param {string} indexDataPath File path for the actual data
   */
  importJSONDocIfNeeded(index, indexMappingPath, indexDataPath) {
    let queryString = '';
    if (typeof index === 'string') {
      queryString = index;
    } else {
      index.forEach(value => queryString += `${value},`);
    }
    cy.getIndices(queryString).then((response) => {
      if(response.status === 404){
        this.importJSONMapping(indexMappingPath);
        this.importJSONDoc(indexDataPath);
      }
    });
  }
}