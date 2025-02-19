// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback } from 'react';
import { Stack, Icon, ActionButton, mergeStyleSets, SearchBox, Text } from '@fluentui/react';
import { useSelector } from 'react-redux';
import { Connection } from 'react-flow-renderer';
import { isEmpty, pick } from 'ramda';

import { nodeTypeModelFactory } from '../../../../store/trainingProjectSlice';
import { ModelNodeType, TrainingProject } from '../../../../store/types';
import { MODOEL_NODE_LIST } from '../../constant';

import SideNavCard from './NavCard';

const getClasses = () =>
  mergeStyleSets({
    root: {},
    sidebarWrapper: { borderBottom: '1px solid #C8C6C4' },
    searchBox: { width: '245px', margin: '10px 0' },
    searchBoxTip: { width: '245px', margin: '10px 0' },
    manageModels: { marginTop: '25px' },
  });

interface Props {
  connectMap: Connection[];
}

const getFilterdNodelList = (modelList: TrainingProject[], target: string): TrainingProject[] => {
  const regex = new RegExp(target, 'i');

  return modelList.filter((model) => {
    const isValueMatch = Object.values(
      pick(['displayName', 'nodeType'] as (keyof TrainingProject)[], model),
    ).find((value: string) => {
      return value.match(regex);
    });

    return isValueMatch;
  });
};

const SideNavList = (props: Props) => {
  const { connectMap } = props;

  const imoprtList = useSelector(nodeTypeModelFactory(['source']));
  const processList = useSelector(nodeTypeModelFactory(['transform']));
  const exportList = useSelector(nodeTypeModelFactory(['export']));

  const [localImportNodeList, setLocalImportNodeList] = useState(imoprtList);
  const [localProcessNodeList, setLocalProcessNodeList] = useState([...MODOEL_NODE_LIST, ...processList]);

  const [localExportNodeList, setLocalExportNodeList] = useState(exportList);

  const [isImportToggle, setIsImportToggle] = useState(false);
  const [isProcessToggle, setIsProcessToggle] = useState(true);
  const [isExportToggle, setIsExportOpen] = useState(true);

  const classes = getClasses();

  const onSearchEnter = useCallback(
    (newValue: string) => {
      setLocalImportNodeList(getFilterdNodelList(imoprtList, newValue));
      setLocalProcessNodeList(getFilterdNodelList([...MODOEL_NODE_LIST, ...processList], newValue));
      setLocalExportNodeList(getFilterdNodelList(exportList, newValue));
    },
    [processList, exportList, imoprtList],
  );

  const onSearchClear = useCallback(() => {
    setLocalImportNodeList(imoprtList);
    setLocalProcessNodeList([...MODOEL_NODE_LIST, ...processList]);
    setLocalExportNodeList(exportList);
  }, [imoprtList, processList, exportList]);

  const onSearchChange = useCallback(
    (newValue: string) => {
      if (isEmpty(newValue)) {
        setLocalImportNodeList(imoprtList);
        setLocalProcessNodeList([...MODOEL_NODE_LIST, ...processList]);
        setLocalExportNodeList(exportList);
      }
    },
    [imoprtList, processList, exportList],
  );

  return (
    <aside
      style={{
        borderRight: '1px solid #eee',
        background: '#fff',
        overflowY: 'auto',
        width: '280px',
      }}
    >
      <Stack>
        <SearchBox
          styles={{ root: classes.searchBox }}
          placeholder="Search"
          onSearch={onSearchEnter}
          onClear={onSearchClear}
          onChange={(_, newValue) => onSearchChange(newValue)}
        />
        <Text styles={{ root: classes.searchBoxTip }}>
          Drag and drop these nodes to the canvas on the right.
        </Text>

        {/* Import */}
        {localImportNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isImportToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Import"
                  iconProps={{ iconName: 'Installation' }}
                  onClick={() => setIsImportToggle((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isImportToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localImportNodeList.map((importNode, id) => (
                  <SideNavCard
                    key={id}
                    displayName={importNode.displayName}
                    name={importNode.name}
                    nodeType={importNode.nodeType}
                    isDraggable={false}
                    connectMap={connectMap}
                    model={{
                      id: importNode.id,
                      name: importNode.name,
                      inputs: importNode.inputs,
                      outputs: importNode.outputs,
                      kan_id: importNode.kan_id,
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}

        {/* Process */}
        {localProcessNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isProcessToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Process"
                  iconProps={{ iconName: 'LineChart' }}
                  onClick={() => setIsProcessToggle((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isProcessToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localProcessNodeList.map((processNode, id) => (
                  <SideNavCard
                    key={id}
                    displayName={processNode.displayName}
                    name={processNode.name}
                    nodeType={processNode.nodeType as ModelNodeType}
                    isDraggable={true}
                    connectMap={connectMap}
                    model={
                      processNode.nodeType === 'model'
                        ? null
                        : {
                            id: processNode.id,
                            name: processNode.name,
                            inputs: processNode.inputs,
                            outputs: processNode.outputs,
                            kan_id: processNode.kan_id,
                          }
                    }
                  />
                ))}
              </Stack>
            )}
          </>
        )}

        {/* Export */}
        {localExportNodeList.length > 0 && (
          <>
            <Stack styles={{ root: classes.sidebarWrapper }}>
              <Stack horizontal verticalAlign="center">
                <Icon iconName={isExportToggle ? 'ChevronUp' : 'ChevronDown'} />
                <ActionButton
                  text="Export"
                  iconProps={{ iconName: 'ModelingView' }}
                  onClick={() => setIsExportOpen((prev) => !prev)}
                />
              </Stack>
            </Stack>
            {isExportToggle && (
              <Stack styles={{ root: { padding: '20px' } }} tokens={{ childrenGap: 20 }}>
                {localExportNodeList.map((ex, id) => (
                  <SideNavCard
                    key={id}
                    name={ex.name}
                    displayName={ex.displayName}
                    nodeType={ex.nodeType}
                    isDraggable={true}
                    connectMap={connectMap}
                    model={{
                      id: ex.id,
                      name: ex.name,
                      inputs: ex.inputs,
                      outputs: ex.outputs,
                      kan_id: ex.kan_id,
                    }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </Stack>
    </aside>
  );
};

export default SideNavList;
