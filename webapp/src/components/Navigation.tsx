import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import {
  makeStyles,
  mergeClasses,
  tokens,
  Text,
  Button,
} from '@fluentui/react-components';
import {
  Home24Regular,
  Home24Filled,
  Info24Regular,
  Info24Filled,
  ChartMultiple24Regular,
  ChartMultiple24Filled,
  Settings24Regular,
  Settings24Filled,
  Navigation24Regular,
  HeartPulse24Regular,
  HeartPulse24Filled,
  People24Regular,
  People24Filled,
  PersonSearch24Regular,
  PersonSearch24Filled,
  Alert24Regular,
  Alert24Filled,
  TargetArrow24Regular,
  TargetArrow24Filled,
  Chat24Regular,
  Chat24Filled,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  nav: {
    height: '100%',
    backgroundColor: '#f5f5f5',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
  },
  navExpanded: {
    width: '250px',
  },
  navCollapsed: {
    width: '48px',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 12px',
    flex: 1,
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground3,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '12px 12px 8px 12px',
    marginTop: '8px',
  },
  spacer: {
    flex: 1,
  },
  navItem: {
    width: '100%',
    justifyContent: 'flex-start',
    borderRadius: 0,
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    minHeight: '36px',
    position: 'relative',
    fontWeight: 400,
    fontSize: '14px',
    color: '#424242',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    marginBottom: '2px',
    backgroundColor: 'transparent',
    borderLeft: '3px solid transparent',
    '& > span': {
      fontSize: '20px',
    },
    ':hover': {
      backgroundColor: '#e8e8e8',
      color: '#424242',
    },
  },
  navItemCollapsed: {
    paddingLeft: '12px',
    paddingRight: '12px',
    justifyContent: 'center',
    borderLeft: 'none !important',
  },
  navItemActive: {
    backgroundColor: 'transparent',
    color: '#424242',
    fontWeight: 500,
    borderLeft: '3px solid #6264A7',
    ':hover': {
      backgroundColor: '#e8e8e8',
      color: '#424242',
    },
  },
  separator: {
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
    margin: '8px 12px',
  },
});

interface NavigationProps {
  isCollapsed: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ isCollapsed }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useRole();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const overviewItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home24Regular />, iconFilled: <Home24Filled /> },
    { path: '/wellbeing', label: 'Wellbeing & Risks', icon: <HeartPulse24Regular />, iconFilled: <HeartPulse24Filled />, roles: ['lead'] },
    { path: '/team', label: 'My Team', icon: <People24Regular />, iconFilled: <People24Filled />, roles: ['lead'] },
    { path: '/member-wellbeing', label: 'Well-Being', icon: <HeartPulse24Regular />, iconFilled: <HeartPulse24Filled />, roles: ['member'] },
    { path: '/signals', label: 'Signals', icon: <Alert24Regular />, iconFilled: <Alert24Filled />, roles: ['member'] },
  ];

  const developmentItems = [
    { path: '/devplan', label: 'Dev Plan', icon: <TargetArrow24Regular />, iconFilled: <TargetArrow24Filled />, roles: ['member'] },
  ];

  const collaborationItems = [
    { path: '/prep', label: '1:1 Planner', icon: <PersonSearch24Regular />, iconFilled: <PersonSearch24Filled /> },
    { path: '/feedback360', label: '360 Feedback', icon: <Chat24Regular />, iconFilled: <Chat24Filled />, roles: ['member'] },
  ];

  const filteredOverviewItems = overviewItems.filter(item => !item.roles || item.roles.includes(role));
  const filteredDevelopmentItems = developmentItems.filter(item => !item.roles || item.roles.includes(role));
  const filteredCollaborationItems = collaborationItems.filter(item => !item.roles || item.roles.includes(role));

  const settingsItem = { path: '/settings', label: 'Settings', icon: <Settings24Regular />, iconFilled: <Settings24Filled /> };

  return (
    <nav className={mergeClasses(styles.nav, isCollapsed ? styles.navCollapsed : styles.navExpanded)}>
      {!isCollapsed && <div className={styles.sectionHeader}>Overview</div>}
      <div className={styles.navList}>
        {filteredOverviewItems.map((item: any) => (
          <Button
            key={item.path}
            appearance="subtle"
            icon={isActive(item.path) ? item.iconFilled : item.icon}
            className={mergeClasses(
              styles.navItem,
              isCollapsed && styles.navItemCollapsed,
              isActive(item.path) && styles.navItemActive
            )}
            onClick={() => navigate(item.path)}
            title={isCollapsed ? item.label : undefined}
          >
            {!isCollapsed && item.label}
          </Button>
        ))}
        
        {!isCollapsed && filteredDevelopmentItems.length > 0 && <div className={styles.sectionHeader} style={{ marginTop: '16px' }}>Development</div>}
        {filteredDevelopmentItems.map((item: any) => (
          <Button
            key={item.path}
            appearance="subtle"
            icon={isActive(item.path) ? item.iconFilled : item.icon}
            className={mergeClasses(
              styles.navItem,
              isCollapsed && styles.navItemCollapsed,
              isActive(item.path) && styles.navItemActive
            )}
            onClick={() => navigate(item.path)}
            title={isCollapsed ? item.label : undefined}
          >
            {!isCollapsed && item.label}
          </Button>
        ))}
        
        {!isCollapsed && filteredCollaborationItems.length > 0 && <div className={styles.sectionHeader} style={{ marginTop: '16px' }}>Collaboration</div>}
        {filteredCollaborationItems.map((item: any) => (
          <Button
            key={item.path}
            appearance="subtle"
            icon={isActive(item.path) ? item.iconFilled : item.icon}
            className={mergeClasses(
              styles.navItem,
              isCollapsed && styles.navItemCollapsed,
              isActive(item.path) && styles.navItemActive
            )}
            onClick={() => navigate(item.path)}
            title={isCollapsed ? item.label : undefined}
          >
            {!isCollapsed && item.label}
          </Button>
        ))}
        
        <div className={styles.spacer} />
        {!isCollapsed && <div className={styles.separator} />}
        <Button
          appearance="subtle"
          icon={isActive(settingsItem.path) ? settingsItem.iconFilled : settingsItem.icon}
          className={mergeClasses(
            styles.navItem,
            isCollapsed && styles.navItemCollapsed,
            isActive(settingsItem.path) && styles.navItemActive
          )}
          onClick={() => navigate(settingsItem.path)}
          title={isCollapsed ? settingsItem.label : undefined}
        >
          {!isCollapsed && settingsItem.label}
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
