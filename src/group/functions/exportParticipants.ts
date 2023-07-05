import Swal from 'sweetalert2';
import { getAllGroups } from './getAllGroups';
import { getParticipants } from '../../whatsapp/functions';

export async function exportGroupToCsv() {
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
