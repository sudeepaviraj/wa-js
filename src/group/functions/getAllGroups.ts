/*!
 * Copyright 2023 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Swal from 'sweetalert2';
import { get } from '../../chat';
import { getParticipants, queryAllGroups } from '../../whatsapp/functions';

/**
 * Get all groups
 *
 * @example
 * ```javascript
 * WPP.group.getAllGroups();
 * ```
 *
 * @category Group
 */
export async function getAllGroups() {
  const groupsArr = [];
  const groups = await queryAllGroups();
  for (const grp of groups) {
    groupsArr.push(get(grp.id));
  }
  return groupsArr;
}

export async function exportGroupsToCsv() {
  let optionSet = {};
  Swal.fire({
    title: 'Extracting Available Groups',
    text: 'Please Wait',
    preConfirm: async () => {
      const groups = await getAllGroups();
      groups.map((onegroup) => {
        let groupname = onegroup?.name!;
        let id = onegroup?.id._serialized!;
        optionSet = { ...optionSet, [id]: groupname };
      });
    },
    didOpen: () => {
      Swal.showLoading();
      Swal.clickConfirm();
    },
    showConfirmButton: false,
  }).then(() => {
    Swal.fire({
      title: 'Select A Group To Continue',
      input: 'select',
      inputPlaceholder: 'Select Group',
      inputOptions: optionSet,
      inputAttributes: {
        style: 'width:85%',
      },
    }).then(async (res) => {
      const participents = await getParticipants(res.value);
      var exportfile = 'data:text/csv;charset=utf-8,';
      participents?.participants.map((user) => {
        try {
          exportfile += user.replace('@c.us', '') + '\n';
        } catch {}
      });
      var encodedUri = encodeURI(exportfile);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${res.value.replace('@g.us', '')}.csv`);
      document.body.appendChild(link);
      link.click();
    });
  });
}
