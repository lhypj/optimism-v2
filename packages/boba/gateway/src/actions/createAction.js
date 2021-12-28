/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import networkService from "services/networkService"

export function createAction (key, asyncAction) {

  return async function (dispatch) {

    dispatch({ type: `${key}/REQUEST` })
    
    try {
      const response = await asyncAction()

      if( response === false ) {
        return false
      }

      //deal with metamask errors
      if(response && response.hasOwnProperty('message') && response.hasOwnProperty('code')) {
        let errorMessage = networkService.handleMetaMaskError(response.code) ?? response.message;
        if (response.hasOwnProperty('data')) { 
          errorMessage = response.data.message
        }
        dispatch({ type: `UI/ERROR/UPDATE`, payload: errorMessage })
        dispatch({ type: `${key}/ERROR` })
        return false
      }

      dispatch({ type: `${key}/SUCCESS`, payload: response })
      return true

    } catch (error) {
      console.log("Error RAW:", {error})
      
      if(error.message.includes('NETWORK_ERROR')) {
        console.log("Internet down")
        return false
      }
      if(error.message.includes('Network Error')) {
        console.log("Internet down")
        return false
      }
      if(error.message.includes('503')) {
        console.log("503 Service Unavailable")
        return false
      }
      const errorMessage = networkService.handleMetaMaskError(error.code) ?? error.message;
      dispatch({ type: `UI/ERROR/UPDATE`, payload: errorMessage })
      dispatch({ type: `${key}/ERROR` })
      return false
    }
  }
}
